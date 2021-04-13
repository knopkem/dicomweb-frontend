import * as React from 'react';
import SeriesItem from './seriesItem';
import DicomViewer from './dicomViewer';
import MPR from './mpr';
import { Grid } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import '../initCornerstone';
import { Config } from '../config';
import { __get } from '../utils';
import { inherit } from 'hammerjs';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
}));

export default function SeriesTable(props) {
  const classes = useStyles();

  const initialState = {
    init: false,
    loaded: false,
    selectionMpr: false,
    studyUid: props.match.params.uid,
    seriesUid: '',
    data: [],
  };
  const init = {
    value: false,
  };
  const [localState, setLocalState] = React.useState(initialState);

  React.useEffect(() => {

    const find = (value) => {
      console.log('running qido query');
      const query = `${Config.hostname}:${Config.port}/${Config.qido}/studies/${value}/series`;
      fetch(query)
        .then((response) => response.json())
        .then((raw) => {
          if (raw) {
            const data = raw.map((row, index) => {
              return {
                id: index,
                seriesDescription: __get(row, '0008103E.Value[0]', 'unnamed'),
                uid: __get(row, '0020000E.Value[0]', ''),
              };
            });
            setLocalState({
              ...localState,
              data,
            });
          }
        });
    };

    if (!localState.init) {
      setLocalState({
        ...localState,
        init: true,
      });
      find(localState.studyUid);
    }
  }, []);

  const onSelectionChange = (e) => {
    setLocalState({
      ...localState,
      seriesUid: e.uid,
      selectionMpr: e.mpr,
      loaded: true,
    });
  };

  return (
    <div>
      <div className={classes.root}>
        <Grid container spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
          {localState.data.map((elem) => (
            <Grid item xs={2} key={elem.id}>
              <SeriesItem id={elem.id} description={elem.seriesDescription} uid={elem.uid} onClick={onSelectionChange}></SeriesItem>
            </Grid>
          ))}
        </Grid>
      </div>
      <div style={{ flex: 1 }}>
        {localState.loaded &&
          (localState.selectionMpr ? (
            <MPR studyUid={localState.studyUid} seriesUid={localState.seriesUid} />
          ) : (
            <DicomViewer studyUid={localState.studyUid} seriesUid={localState.seriesUid} />
          ))}
      </div>
    </div>
  );
}
