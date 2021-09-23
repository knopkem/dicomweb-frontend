import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActionArea, Typography, CardContent } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    minWidth: 50,
  },
  title: {
    fontSize: 11,
  }
});

export default function SeriesItem(props) {
  const classes = useStyles();

  const { description, modality, uid, onClick } = props;

  const handleClick = () => {
    onClick({ uid });
  };
  return (
    <Card className={classes.root}>
      <CardActionArea onClick={handleClick}>
      <CardContent>
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
