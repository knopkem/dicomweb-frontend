import React from 'react';
import { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import { View2D, getImageData, loadImageData, View3D } from 'react-vtkjs-viewport';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import LinearProgress from '@material-ui/core/LinearProgress';
import presets from '../presets.js';
import { Config } from '../config';

window.cornerstoneTools = cornerstoneTools;

function createActorMapper(imageData) {
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(imageData);
  
    const actor = vtkVolume.newInstance();
    actor.setMapper(mapper);
  
    return {
      actor,
      mapper,
    };
  }
  
  function getShiftRange(colorTransferArray) {
    // Credit to paraview-glance
    // https://github.com/Kitware/paraview-glance/blob/3fec8eeff31e9c19ad5b6bff8e7159bd745e2ba9/src/components/controls/ColorBy/script.js#L133
  
    // shift range is original rgb/opacity range centered around 0
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < colorTransferArray.length; i += 4) {
      min = Math.min(min, colorTransferArray[i]);
      max = Math.max(max, colorTransferArray[i]);
    }
  
    const center = (max - min) / 2;
  
    return {
      shiftRange: [-center, center],
      min,
      max,
    };
  }
  
  function applyPointsToPiecewiseFunction(points, range, pwf) {
    const width = range[1] - range[0];
    const rescaled = points.map(([x, y]) => [x * width + range[0], y]);
  
    pwf.removeAllPoints();
    rescaled.forEach(([x, y]) => pwf.addPoint(x, y));
  
    return rescaled;
  }
  
  function applyPointsToRGBFunction(points, range, cfun) {
    const width = range[1] - range[0];
    const rescaled = points.map(([x, r, g, b]) => [
      x * width + range[0],
      r,
      g,
      b,
    ]);
  
    cfun.removeAllPoints();
    rescaled.forEach(([x, r, g, b]) => cfun.addRGBPoint(x, r, g, b));
  
    return rescaled;
  }

function applyPreset(actor, preset) {
    // Create color transfer function
    const colorTransferArray = preset.colorTransfer
      .split(' ')
      .splice(1)
      .map(parseFloat);
  
    const { shiftRange } = getShiftRange(colorTransferArray);
    let min = shiftRange[0];
    const width = shiftRange[1] - shiftRange[0];
    const cfun = vtkColorTransferFunction.newInstance();
    const normColorTransferValuePoints = [];
    for (let i = 0; i < colorTransferArray.length; i += 4) {
      let value = colorTransferArray[i];
      const r = colorTransferArray[i + 1];
      const g = colorTransferArray[i + 2];
      const b = colorTransferArray[i + 3];
  
      value = (value - min) / width;
      normColorTransferValuePoints.push([value, r, g, b]);
    }
  
    applyPointsToRGBFunction(normColorTransferValuePoints, shiftRange, cfun);
  
    actor.getProperty().setRGBTransferFunction(0, cfun);
  
    // Create scalar opacity function
    const scalarOpacityArray = preset.scalarOpacity
      .split(' ')
      .splice(1)
      .map(parseFloat);
  
    const ofun = vtkPiecewiseFunction.newInstance();
    const normPoints = [];
    for (let i = 0; i < scalarOpacityArray.length; i += 2) {
      let value = scalarOpacityArray[i];
      const opacity = scalarOpacityArray[i + 1];
  
      value = (value - min) / width;
  
      normPoints.push([value, opacity]);
    }
  
    applyPointsToPiecewiseFunction(normPoints, shiftRange, ofun);
  
    actor.getProperty().setScalarOpacity(0, ofun);
  
    const [
      gradientMinValue,
      gradientMinOpacity,
      gradientMaxValue,
      gradientMaxOpacity,
    ] = preset.gradientOpacity
      .split(' ')
      .splice(1)
      .map(parseFloat);
  
    actor.getProperty().setUseGradientOpacity(0, true);
    actor.getProperty().setGradientOpacityMinimumValue(0, gradientMinValue);
    actor.getProperty().setGradientOpacityMinimumOpacity(0, gradientMinOpacity);
    actor.getProperty().setGradientOpacityMaximumValue(0, gradientMaxValue);
    actor.getProperty().setGradientOpacityMaximumOpacity(0, gradientMaxOpacity);
  
    if (preset.interpolation === '1') {
      actor.getProperty().setInterpolationTypeToFastLinear();
      //actor.getProperty().setInterpolationTypeToLinear()
    }
  
    const ambient = parseFloat(preset.ambient);
    //const shade = preset.shade === '1'
    const diffuse = parseFloat(preset.diffuse);
    const specular = parseFloat(preset.specular);
    const specularPower = parseFloat(preset.specularPower);
  
    //actor.getProperty().setShade(shade)
    actor.getProperty().setAmbient(ambient);
    actor.getProperty().setDiffuse(diffuse);
    actor.getProperty().setSpecular(specular);
    actor.getProperty().setSpecularPower(specularPower);
  }

function createCT3dPipeline(imageData, ctTransferFunctionPresetId) {
    const { actor, mapper } = createActorMapper(imageData);
  
    const sampleDistance =
      1.2 *
      Math.sqrt(
        imageData
          .getSpacing()
          .map(v => v * v)
          .reduce((a, b) => a + b, 0)
      );
  
    const range = imageData
      .getPointData()
      .getScalars()
      .getRange();
    actor
      .getProperty()
      .getRGBTransferFunction(0)
      .setRange(range[0], range[1]);
  
    mapper.setSampleDistance(sampleDistance);
  
    const preset = presets.find(
      preset => preset.id === ctTransferFunctionPresetId
    );
  
    applyPreset(actor, preset);
  
    actor.getProperty().setScalarOpacityUnitDistance(0, 2.5);
  
    return actor;
  }

class MPR extends Component {
    constructor(props) {
        super(props);
    this.state = {
        volumes: null,
        vtkImageData: null,
        cornerstoneViewportData: null,
        focusedWidgetId: null,
        isSetup: false,
        volumeRenderingVolumes: null,
        ctTransferFunctionPresetId: 'vtkMRMLVolumePropertyNode18',
        petColorMapId: 'hsv',
        percentComplete: 0,
        }
    }
  
  ORIENTATION = {
    AXIAL: {
      slicePlaneNormal: [0, 0, 1],
      sliceViewUp: [0, -1, 0],
    },
    SAGITTAL: {
      slicePlaneNormal: [1, 0, 0],
      sliceViewUp: [0, 0, 1],
    },
    CORONAL: {
      slicePlaneNormal: [0, 1, 0],
      sliceViewUp: [0, 0, 1],
    },
  };
  
   voi = {
    // In SUV as this example uses a PET
    windowCenter: 40,
    windowWidth: 400,
  };
  
   createActorMapper(imageData) {
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(imageData);
  
    const actor = vtkVolume.newInstance();
    actor.setMapper(mapper);
  
    return {
      actor,
      mapper,
    };
  }
  
  async getImageIds() {

    const imageIds = [];
  
    const response = await fetch(`${Config.hostname}:${Config.port}/${Config.qido}/studies/${this.props.studyUid}/series/${this.props.seriesUid}/instances`);
    const json = await response.json();
    json.forEach(item => {
      const objectUid = item['00080018'].Value[0];
      const imageId = `wadouri:${Config.hostname}:${Config.port}/${Config.wadouri}/?requestType=WADO&studyUID=${this.props.studyUid}&seriesUID=${this.props.seriesUid}&objectUID=${objectUid}&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.1`;
      imageIds.push(imageId);
    });
  
    return imageIds;
  }

  rerenderAll = () => {
    // Update all render windows, since the automatic re-render might not
    // happen if the viewport is not currently using the painting widget
    Object.keys(this.apis).forEach(viewportIndex => {
      const renderWindow = this.apis[
        viewportIndex
      ].genericRenderWindow.getRenderWindow();

      renderWindow.render();
    });
  };


  async componentDidMount() {
    this.components = {};
    this.cornerstoneElements = {};

    this.apis = [];

    const imageIds = await this.getImageIds();

    // Pre-retrieve the images for demo purposes
    // Note: In a real application you wouldn't need to do this
    // since you would probably have the image metadata ahead of time.
    // In this case, we preload the images so the WADO Image Loader can
    // read and store all of their metadata and subsequently the 'getImageData'
    // can run properly (it requires metadata).
    const promises = imageIds.map(imageId => {
      return cornerstone.loadAndCacheImage(imageId);
    });

    Promise.all(promises).then(
      () => {

        const displaySetInstanceUid = this.props.seriesUid;
        const cornerstoneViewportData = {
          stack: {
            imageIds,
            currentImageIdIndex: 0,
          },
          displaySetInstanceUid,
        };

        const imageDataObject = this.loadDataset(imageIds, displaySetInstanceUid);

        const ctVolVR = createCT3dPipeline(
            imageDataObject.vtkImageData,
            this.state.ctTransferFunctionPresetId
          );


        const { actor } = this.createActorMapper(imageDataObject.vtkImageData);

        this.imageDataObject = imageDataObject;

        const rgbTransferFunction = actor
          .getProperty()
          .getRGBTransferFunction(0);

        const low = this.voi.windowCenter - this.voi.windowWidth / 2;
        const high = this.voi.windowCenter + this.voi.windowWidth / 2;

        rgbTransferFunction.setMappingRange(low, high);

        this.setState({
          vtkImageData: imageDataObject.vtkImageData,
          volumes: [actor],
          cornerstoneViewportData,
          volumeRenderingVolumes: [ctVolVR]
        });
        this.rerenderAll();
      },
      error => {
        throw new Error(error);
      }
    );
  }

  saveApiReference = api => {
    this.apis = [api];
  };

  handleChangeCTTransferFunction = event => {
    const ctTransferFunctionPresetId = event.target.value;
    const preset = presets.find(
      preset => preset.id === ctTransferFunctionPresetId
    );

    const actor = this.state.volumeRenderingVolumes[0];

    applyPreset(actor, preset);

    this.rerenderAll();

    this.setState({
      ctTransferFunctionPresetId,
    });
  };

  storeApi = orientation => {
    return api => {
      const renderWindow = api.genericRenderWindow.getRenderWindow();
      const istyle = renderWindow.getInteractor().getInteractorStyle();

      const { slicePlaneNormal, sliceViewUp } = this.ORIENTATION[orientation];

      istyle.setSliceOrientation(slicePlaneNormal, sliceViewUp);

      const onPixelDataInsertedCallback = () => {
        renderWindow.render();
      };

      this.imageDataObject.onPixelDataInserted(onPixelDataInsertedCallback);

      renderWindow.render();
    };
  };

  loadDataset(imageIds, displaySetInstanceUid) {
    const imageDataObject = getImageData(imageIds, displaySetInstanceUid);

    loadImageData(imageDataObject);

    const numberOfFrames = imageIds.length;

    const onPixelDataInsertedCallback = numberProcessed => {
      const percentComplete = Math.floor(
        (numberProcessed * 100) / numberOfFrames
      );

      if (this.state.percentComplete !== percentComplete) {
        this.setState({ percentComplete });
        this.forceUpdate();
      }

      if (percentComplete % 20 === 0) {
        this.rerenderAll();
      }
    };

    const onAllPixelDataInsertedCallback = () => {
      this.rerenderAll();
    };

    imageDataObject.onPixelDataInserted(onPixelDataInsertedCallback);
    imageDataObject.onAllPixelDataInserted(onAllPixelDataInsertedCallback);

    return imageDataObject;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {

    if (!this.state.volumes || !this.state.volumes.length) {
      return (
      <div>
         <div style={{ width: '100%'}}>
            <LinearProgress  />
         </div>
      </div>
      )
    } else {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="col-xs-12">
            {this.state.volumes && (
              <>
                <div className="col-xs-12 col-sm-3">
                  <View2D
                    volumes={this.state.volumes}
                    onCreated={this.storeApi('AXIAL')}
                  />
                </div>
                <div className="col-xs-12 col-sm-3">
                  <View2D
                    volumes={this.state.volumes}
                    onCreated={this.storeApi('SAGITTAL')}
                  />
                </div>
                <div className="col-xs-12 col-sm-3">
                  <View2D
                    volumes={this.state.volumes}
                    onCreated={this.storeApi('CORONAL')}
                  />
                </div>
                <div className="col-xs-12 col-sm-3">
                  <View3D
                    volumes={this.state.volumeRenderingVolumes}
                    onCreated={this.saveApiReference}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
            }
  }
}

export default MPR;