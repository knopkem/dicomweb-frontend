import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Config } from '../config';
import { __get } from '../utils';

export default function StudyTable(props) {

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'patientName', headerName: 'Patient name', width: 200 },
    { field: 'patientId', headerName: 'MRN', width: 130 },
    { field: 'accession', headerName: 'Accession', width: 200 },
    { field: 'studyDate', headerName: 'Study date', width: 200 },
    { field: 'modality', headerName: 'Mx', width: 100 },
    { field: 'studyDescription', headerName: 'Study description', width: 250 },
  ];

  const {onStudySelected} = props;

  const [rows, setRows] = React.useState([]);
  const [uids, setUids] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    const abortController = new AbortController();

    try {
      find('', abortController);
    } catch (e) {
      // only call dispatch when we know the fetch was not aborted
      if (!abortController.signal.aborted) {
        console.error(e.message);
      }
    }
    return () => {
      abortController.abort();
    };
  }, []);

  const find = (value, abortController) => {
    const query = `${Config.hostname}:${Config.port}/${Config.qido}/studies?includefield=00081030%2C00080060%2C00080020&StudyDate=19520428-20201008&PatientName=${value}`;
    const options = abortController ? { signal: abortController.signal } : {};
    fetch(query, options)
      .then((response) => response.json())
      .then((data) => {
        const rows = data.map((row, index) => {
          return {
            id: index,
            patientName: __get(row, '00100010.Value[0].Alphabetic', 'no name'),
            patientId: __get(row, '00100020.Value[0]', 'no id'),
            accession: __get(row, '00080050.Value[0]', ''),
            studyDate: __get(row, '00080020.Value[0]', ''),
            modality: __get(row, '00080061.Value[0]', ''),
            studyDescription: __get(row, '00081030.Value[0]', ''),
          };
        });
        setRows(rows);

        const uids = data.map((row) => __get(row, '0020000D.Value[0]', ''));
        setUids(uids);
      });
  };

  const onRowSelected = (e) => {
    const uid = uids[e.id];
    onStudySelected(uid);
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns}  checkboxSelection={false} onRowClick={onRowSelected} />
    </div>
  );
}

// <SearchBar value={searchValue} onChange={(newValue) => setSearchValue(newValue)} onRequestSearch={() => find(searchValue)} />
      
