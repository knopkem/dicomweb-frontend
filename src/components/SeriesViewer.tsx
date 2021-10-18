import React, { useState } from 'react';
import SeriesItem from './SeriesItem';
import DicomViewer from './DicomViewer';
import { Grid, Button, Box } from '@mui/material/';
import { useHistory } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import '../initCornerstone';
import { Config } from '../config';
import { __get } from '../utils';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    height: '100vh',
  },
}));

export default function SeriesViewer(props: any) {
  const classes = useStyles();
  const history = useHistory();

  const [data, setData] = useState([]);
  const { studyUid } = props.match.params;
  const [seriesUid, setSeriesUid] = useState(props.match.params.seriesUid);

  React.useEffect(() => {
    const find = (studyUid: any) => {
      const query = `${Config.hostname}:${Config.port}/${Config.qido}/studies/${studyUid}/series`;

      fetch(query)
        .then((response) => response.json())
        .then((raw) => {
          if (raw) {
            const responseData = raw.map((row: any, index: any) => {
              return {
                id: index,
                modality: __get(row, '00080060.Value[0]', '?'),
                seriesDescription: __get(row, '0008103E.Value[0]', 'unnamed'),
                seriesUid: __get(row, '0020000E.Value[0]', ''),
              };
            });
            setData(responseData);
          }
        });
    };
    find(studyUid);
  }, []);

  const onSelectionChange = (e: any) => {
    if (e.seriesUid) {
      setSeriesUid(e.seriesUid);
    }
  };

  return (
    <div className={classes.root}>
      <Button
        onClick={() => {
          history.goBack();
        }}
      >
        Back to StudyBrowser
      </Button>

      <Box border={1}>
        <Grid container spacing={0} direction="row" justifyContent="flex-start" alignItems="flex-start">
          {data.map((elem: any) => (
            <Grid item xs={2} key={elem.id}>
              <SeriesItem
                id={elem.id}
                description={elem.seriesDescription}
                modality={elem.modality}
                studyUid={studyUid}
                seriesUid={elem.seriesUid}
                selected={seriesUid == elem.seriesUid}
                onClick={onSelectionChange}
              ></SeriesItem>
            </Grid>
          ))}
        </Grid>
      </Box>

      <DicomViewer studyUid={studyUid} seriesUid={seriesUid} />
    </div>
  );
}
