import React, { useState } from 'react';
import StudyTable from './components/StudyTable';
import NavBar from './components/Navbar';
import SeriesTable from './components/SeriesTable';
import { Container } from '@mui/material/';

export default function StudyBrowser() {
  const [studyUID, setStudyUID] = useState('');

  return (
    <Container component="main">
      <NavBar />
      <StudyTable onStudySelected={setStudyUID} />
      <SeriesTable studyUID={studyUID} />
    </Container>
  );
}
