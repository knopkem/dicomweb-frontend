import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import SearchBar from 'material-ui-search-bar';
import { useHistory } from "react-router-dom";
import { Config } from './config';
import _ from 'lodash'


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

    const [data, setData] = React.useState([]);
    const [, setSelection] = React.useState([]);
    const [searchValue, setSearchValue] = React.useState('');

    React.useEffect(() => {

        const abortController = new AbortController();

        try {
            find('', abortController);
        } catch (e) {
            // only call dispatch when we know the fetch was not aborted
            if (!abortController.signal.aborted) {
                console.log(e.message);
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
        .then(response => response.json())
        .then(data => {
            const res = data.map( (row, index) => {
                return {
                    id: index,
                    patientName: _.get(row, "['00100010'].Value[0].Alphabetic", 'no name'),
                    patientId: _.get(row, "['00100020'].Value[0]", 'no id'),
                    accession: _.get(row, "['00080050'].Value[0]", ''),
                    studyDate: _.get(row, "['00080020'].Value[0]", ''),
                    modality: _.get(row, "['00080061'].Value[0]", ''),
                    studyDescription: _.get(row, "['00081030'].Value[0]", ''),
                    uid: _.get(row, "['0020000D'].Value[0]", ''),
                }
            });
            setData(res);
            }
        );
    }

    const onSelectionChange = (e) => {
        console.log(data[e.rowIds['0']].uid);
        setSelection(e.rowIds);

        setTimeout(() => {
            const uid = data[e.rowIds['0']].uid;
            const path = `/viewer/${uid}`;
            history.push(path);
        }, 0);
    }

  return (
    <div style={{ height: 400, width: '100%' }}>
      <SearchBar value={searchValue} onChange={(newValue) => setSearchValue( newValue )} onRequestSearch={() => find(searchValue)} />
      <DataGrid rows={data} columns={columns} pageSize={15} checkboxSelection={false} onSelectionChange={onSelectionChange}/>
    </div>
  );
}