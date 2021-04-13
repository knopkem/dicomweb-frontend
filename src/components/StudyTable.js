import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import SearchBar from 'material-ui-search-bar';
import { useHistory } from 'react-router-dom';
import { Config } from '../config';
import { __get } from '../utils';
import { useQuery } from 'react-query';

export default function StudyTable() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'patientName', headerName: 'Patient name', width: 130 },
    { field: 'patientId', headerName: 'MRN', width: 130 },
    { field: 'accession', headerName: 'Accession', width: 90 },
    { field: 'studyDate', headerName: 'Study date', width: 130 },
    { field: 'modality', headerName: 'Modality', width: 70 },
    { field: 'studyDescription', headerName: 'Study description', width: 130 },
    { field: 'uid', headerName: 'Study UID', width: 280 },
  ];

  const history = useHistory();

  const [, setSelection] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');

  const onSelectionChange = (e) => {
    console.log(data[e.rowIds['0']].uid);
    setSelection(e.rowIds);

    setTimeout(() => {
      const uid = data[e.rowIds['0']].uid;
      const path = `/viewer/${uid}`;
      history.push(path);
    }, 0);
  };

  const handleClick = () => {
    console.log('click');
    refetch();
  };

  const { isLoading, error, data, refetch } = useQuery('studyQuery', async () => {

    let url = new URL(`${Config.hostname}:${Config.port}/${Config.qido}/studies`);
    const params = {
      includefield: '00081030%2C00080060%2C00080020', 
      StudyDate: '19520428-20201008',
      PatientName: searchValue,
    } 
    url.search = new URLSearchParams(params).toString();

    console.log('fetching studies');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if(data) {
      const res = data.map((row, index) => {
        return {
          id: index,
          patientName: __get(row, '00100010.Value[0].Alphabetic', 'no name'),
          patientId: __get(row, '00100020.Value[0]', 'no id'),
          accession: __get(row, '00080050.Value[0]', ''),
          studyDate: __get(row, '00080020.Value[0]', ''),
          modality: __get(row, '00080061.Value[0]', ''),
          studyDescription: __get(row, '00081030.Value[0]', ''),
          uid: __get(row, '0020000D.Value[0]', ''),
        };
      });
      return res;
    }
  }, {
    refetchOnWindowFocus: false,
  });
   
  if (isLoading) return 'Loading...'
 
  if (error) return 'An error has occurred: ' + error.message

  return (
    <div style={{ height: 400, width: '100%' }}>
      <SearchBar value={searchValue} onChange={(newValue) => setSearchValue(newValue)} onRequestSearch={ handleClick } />
      <DataGrid rows={data} columns={columns} pageSize={15} checkboxSelection={false} onSelectionChange={onSelectionChange} />
    </div>
  );
}
