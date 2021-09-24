import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActionArea, Typography, CardContent } from '@material-ui/core';

const useStyles = makeStyles((theme) => {
  return ({
  root: {
    minWidth: 50,
    margin: 4,
  },
  selected: {
    backgroundColor: theme.palette.primary.light,
  },
  title: {
    fontSize: 11,
  },
})});

export default function SeriesItem(props) {
  const classes = useStyles();

  const { description, modality, seriesUid, studyUid, onClick, selected } = props;

  const handleClick = () => {
    onClick({ studyUid, seriesUid });
  };
  return (
    <Card className={classes.root}>
      <CardActionArea onClick={handleClick}>
        <CardContent className={selected ? classes.selected : ''}>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            Series Description
          </Typography>
          <Typography variant="h6" component="h2">
            {description}
          </Typography>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            Modality
          </Typography>
          <Typography variant="body2" component="p">
            {modality}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
