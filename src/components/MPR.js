import React from 'react';
import { Component } from 'react';

import Grid from '@material-ui/core/Grid';
import { View2D, getImageData, loadImageData } from 'react-vtkjs-viewport';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import '../initCornerstone.js';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
window.cornerstoneTools = cornerstoneTools;



class MPR extends Component {
  state = {
    volumes: null,
    vtkImageData: null,
    cornerstoneViewportData: null,
    focusedWidgetId: null,
    isSetup: false,
  };

  
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
    const host = 'http://localhost';
  
    // dicomweb-proxy config
    const port = '5000';
    const qidoRoute = 'viewer/rs/studies';
    const wadoRoute = 'viewer/wadouri';
  
    const response = await fetch(`${host}:${port}/${qidoRoute}/${this.props.studyUid}/series/${this.props.seriesUid}/instances`);
    const json = await response.json();
    json.forEach(item => {
      const objectUid = item['00080018'].Value[0];
      const imageId = `wadouri:${host}:${port}/${wadoRoute}/?requestType=WADO&studyUID=${this.props.studyUid}&seriesUID=${this.props.seriesUid}&objectUID=${objectUid}&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.1`;
      imageIds.push(imageId);
    });
  
    return imageIds;
  }


  async componentDidMount() {
    this.components = {};
    this.cornerstoneElements = {};


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

        const imageDataObject = getImageData(imageIds, displaySetInstanceUid);

        loadImageData(imageDataObject);

        const onPixelDataInsertedCallback = numberProcessed => {
          const percentComplete = Math.floor(
            (numberProcessed * 100) / imageIds.length
          );

          console.log(`Processing: ${percentComplete}%`);
        };

        imageDataObject.onPixelDataInserted(onPixelDataInsertedCallback);

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
        });
      },
      error => {
        throw new Error(error);
      }
    );
  }

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

  render() {
    if (!this.state.volumes || !this.state.volumes.length) {
      return <h4>Loading dataset...</h4>;
    }
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
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default MPR;