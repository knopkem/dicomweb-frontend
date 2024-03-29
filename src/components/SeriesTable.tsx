import * as React from 'react';
import SeriesItem from './SeriesItem';
import { Grid, Box } from '@mui/material/';
import makeStyles from '@mui/styles/makeStyles';
import { useHistory } from 'react-router-dom';
import '../initCornerstone';
import { Config } from '../config';
import get from 'lodash.get';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

export default function SeriesTable(props: any) {
  const classes = useStyles();
  const history = useHistory();

  const { studyUID } = props;
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    if (!studyUID) return;

    const find = (studyUid: any) => {
      const query = `${Config.hostname}:${Config.port}/${Config.qido}/studies/${studyUid}/series`;
      fetch(query)
        .then((response) => response.json())
        .then((raw) => {
          if (raw) {
            const data = raw.map((row: any, index: any) => {
              return {
                id: index,
                modality: get(row, '00080060.Value[0]', '?'),
                seriesDescription: get(row, '0008103E.Value[0]', '?'),
                studyUid,
                seriesUid: get(row, '0020000E.Value[0]', ''),
              };
            });
            setRows(data);
          }
        });
    };

    find(studyUID);
  }, [studyUID, setRows]);

  const onSelectionChange = (e: any) => {
    const path = `/viewer/${e.studyUid}/${e.seriesUid}`;
    history.push(path);
  };

  return (
    <div className={classes.root}>
      <Box border={0}>
        <Grid container spacing={0} direction="row" justifyContent="flex-start" alignItems="flex-start">
          {rows.map((elem: any) => (
            <Grid item xs={2} key={elem.id}>
              <SeriesItem
                id={elem.id}
                description={elem.seriesDescription}
                modality={elem.modality}
                studyUid={elem.studyUid}
                seriesUid={elem.seriesUid}
                selected={false}
                onClick={onSelectionChange}
              ></SeriesItem>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
}
