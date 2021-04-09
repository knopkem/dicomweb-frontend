import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 50,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.4)',
  },
  title: {
    fontSize: 11,
  },
  pos: {
    marginBottom: 2,
  },
});

export default function SeriesItem(props) {
  const classes = useStyles();

  const handleClick = () => {
    props.onClick({ uid: props.uid, mpr: false });
  };
  const handleClick2 = () => {
    props.onClick({ uid: props.uid, mpr: true });
  };
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Series Description
        </Typography>
        <Typography variant="h5" component="h2">
          {props.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleClick}>
          Open Viewer
        </Button>
        <Button size="small" onClick={handleClick2}>
          Open MPR
        </Button>
      </CardActions>
    </Card>
  );
}
