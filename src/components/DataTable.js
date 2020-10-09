import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import SearchBar from "material-ui-search-bar";

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'patientName', headerName: 'Patient name', width: 130 },
  { field: 'patientId', headerName: 'MRN', width: 130 },
  { field: 'accession', headerName: 'Accession', width: 90 },
  { field: 'studyDate', headerName: 'Study date', width: 130 },
  { field: 'modality', headerName: 'Modality', width: 70 },  
  { field: 'studyDescription', headerName: 'Study description', width: 130 },
];

export default function DataTable() {

    const [data, setData] = React.useState([]);
    const [init, setInit] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    
    React.useEffect(() => {
        if (!init) {
            find('');
            setInit(true);
        }
    },[init]);
    
    const find = (value) => {
        const query = `http://localhost:5000/rs/studies?includefield=00081030%2C00080060%2C00080020&StudyDate=19520428-20201008&PatientName=${value}`;
        fetch(query)
        .then(response => response.json())
        .then(data => {
            const res = data.map( (row, index) => {
                return {
                    id: index,
                    patientName: row['00100010'].Value[0].Alphabetic,
                    patientId: row['00100020'].Value[0],
                    accession: row['00080050'].Value[0],
                    studyDate: row['00080020'].Value[0],
                    modality: row['00080061'].Value[0],
                    studyDescription: row['00081030'].Value[0],
                }
            });
            setData(res);
            }
        );
    } 

  return (
    <div style={{ height: 800, width: '100%' }}>
      <SearchBar value={searchValue} onChange={(newValue) => setSearchValue( newValue )} onRequestSearch={() => find(searchValue)} />
      <DataGrid rows={data} columns={columns} pageSize={15} checkboxSelection />
    </div>
  );
}