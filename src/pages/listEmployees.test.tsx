/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; 
import { Provider } from 'react-redux';
import { render, screen,  fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import ListEmployees from './ListEmployees';
import { dataEmployeesMock, dataColumnsMock } from '../mocks/data';
import { Columns, Employee } from "../mocks/data";
// import { Table } from 'typescript-table';
// jest.mock('typescript-table', () => ({
//   Table: () => <table data-testid="mocked-table" data={dataEmployeesMock} columns={dataColumnsMock} />,
// }));



const mockStore = configureStore([]);

describe('ListEmployees component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      employees: dataEmployeesMock
    });
  });

  it('should render a header with a logo and a link to add new employee', () => {
    render(
      <Provider store={store}>
        <Router> 
          <ListEmployees />
        </Router>
      </Provider>,
    );

    const logo = screen.getByAltText('HRnet Logo');
    const title = screen.getByText('HRnet');
    const link = screen.getByText('Add New Employee');
    const table = screen.getByRole('table');

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(table).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/newemployee');

    const header = screen.getByTestId('header_ListEmployees');

    expect(header).toHaveClass('header_ListEmployees');
    });
});



describe('table component', () => { 
    let store: any;

    beforeEach(() => {
      store = mockStore({
        employees: dataEmployeesMock
      });
    });
    it('renders table header and data correctly', () => {
      render(
        <Provider store={store}>
          <Router>
            <ListEmployees />
          </Router>
        </Provider>,
      );
    
      // Vérifiez que chaque en-tête de colonne est présent
      dataColumnsMock.forEach((column) => {
        expect(screen.getByText(column.label)).toBeInTheDocument();
      });
    
      // Vérifiez que chaque donnée est présente
      const table = screen.getByRole('table');
      // eslint-disable-next-line testing-library/no-node-access
      const rows = table.querySelectorAll('tbody > tr');
      // eslint-disable-next-line testing-library/no-node-access
      const cells = rows[0].querySelectorAll('td');
      expect(cells).toHaveLength(dataColumnsMock.length); 
      expect(cells[0]).toHaveTextContent('John');
      expect(cells[1]).toHaveTextContent('Doe'); 
      expect(cells[2]).toHaveTextContent('01/04/2022'); 
    });
})


describe('Table', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      employees: dataEmployeesMock
    });
  });
  test('hides column when isVisible is set to false', async () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Street')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Manage Columns'));

    const listItem = screen.getByTestId('inputManaged-department');

    fireEvent.click(listItem);
    fireEvent.click(screen.getByText('Manage Columns'));
    
    const columnVisible = screen.getByTestId('columnManaged-firstname');
    expect(columnVisible).toBeInTheDocument();
    expect(screen.queryByText('department')).not.toBeInTheDocument();
  });

  test("change perPage value and check if the number of displayed rows changes", () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );

    let displayedRows = screen.getAllByRole('row');
    expect(displayedRows.length).toBe(11); 
    // Ouvrir le menu déroulant
    const btnPerPage = screen.getByTestId('btnPerPage');
    fireEvent.click(btnPerPage);

    const optionElement = screen.getByTestId(`optionPerPage-5`);
    fireEvent.click(optionElement);

    // Vérifier si le nombre de lignes affichées a changé en conséquence
    displayedRows = screen.getAllByRole('row');
    expect(displayedRows.length).toBe(6); // Ajouter 1 pour inclure la ligne d'en-tête
  });

  it('renders the firstName property of the first dataExample object', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );

    const firstNameCell = screen.getByRole('cell', { name: dataEmployeesMock[0].firstname });
    expect(firstNameCell).toBeInTheDocument();
  });

  it('renders a table with the correct data and columns', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );
    const table = screen.getByRole('table');

    // eslint-disable-next-line testing-library/no-node-access
    const headers = table.querySelectorAll('th');
    expect(headers).toHaveLength(dataColumnsMock.length);
    headers.forEach((header: any, index:any) => {
      expect(header).toHaveTextContent(dataColumnsMock[index].label);
    });

    // eslint-disable-next-line testing-library/no-node-access
    const rows = table.querySelectorAll('tbody > tr');
    expect(rows).toHaveLength(10);

    rows.forEach((row, rowIndex) => {
      // eslint-disable-next-line testing-library/no-node-access
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(dataColumnsMock.length);
      cells.forEach((cell:any, cellIndex:number) => {
        const employeeProperty : string = dataColumnsMock[cellIndex].property;
        expect(cell).toHaveTextContent(dataEmployeesMock[rowIndex][employeeProperty as keyof Employee]);
      });
    });
  });

  test('sorts the table by the ascendant firstName column', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );
    const firstNameHeader = screen.getByTestId('btnSortByAsc-firstname');
    fireEvent.click(firstNameHeader);
  
    const sortedData = dataEmployeesMock.slice().sort((a, b) => a.firstname.localeCompare(b.firstname));
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody > tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      expect(cells[0]).toHaveTextContent(sortedData[rowIndex].firstname.toString());
    });
  });

  test('sorts the table by descendant the firstName column', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );
    const firstNameAscHeader = screen.getByTestId('btnSortByAsc-firstname');
    fireEvent.click(firstNameAscHeader);
    const firstNameDescHeader = screen.getByTestId('btnSortbyDesc-firstname');
    fireEvent.click(firstNameDescHeader);
  
    const sortedData = dataEmployeesMock.slice().sort((a, b) => b.firstname.localeCompare(a.firstname));
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody > tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
    
      expect(cells[0]).toHaveTextContent(sortedData[rowIndex].firstname.toString());
    });
  });

  test('sorts the table by the dateOfBirth column', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );
    
    const dateOfBirthHeader = screen.getByTestId('btnSortByAsc-dateOfBirth');
    fireEvent.click(dateOfBirthHeader);
  
    const sortedData = dataEmployeesMock.slice().sort((a, b) => {
      const datePartsA = a.dateOfBirth.split('/').map(Number);
      const datePartsB = b.dateOfBirth.split('/').map(Number);
      const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
      const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
      return dateA.valueOf() - dateB.valueOf();
    });
  
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody > tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      expect(cells[4]).toHaveTextContent(sortedData[rowIndex].dateOfBirth.toString());
    });
  });
})

describe('table feature component', () => { 
  let store: any;

  beforeEach(() => {
    store = mockStore({
      employees: dataEmployeesMock
    });
  });
  test('Search by property functionality works correctly', () => {
    render(
      <Provider store={store}>
        <Router>
          <ListEmployees />
        </Router>
      </Provider>,
    );
   

    // Trigger the onChange event on the general search input with a search term
    const searchByFirstname = screen.getByTestId('btnOpenSearch-firstname');
    fireEvent.click(searchByFirstname);
    fireEvent.change(screen.getByTestId('btnSearch-firstname'), { target: { value: 'Bob' } });

    // Check that expected elements are present and unexpected elements are absent
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30/09/1978')).toBeInTheDocument();
    expect(screen.queryByText('Jane')).not.toBeInTheDocument();
    expect(screen.queryByText('17/05/1985')).not.toBeInTheDocument();
    // expect(screen.queryByText('')).not.toBeInTheDocument();
    // expect(screen.queryByText('35')).not.toBeInTheDocument();

    const resetButton = screen.getByTestId('btnResetClose-firstname');
    fireEvent.click(resetButton);

    expect(screen.queryByText('Jane')).toBeInTheDocument();
  });

  // test('general search functionality works correctly', () => {
  //   // Provide example data and columns for testing
  //   const datasExample = [
  //     { name: 'Alice', age: 30 },
  //     { name: 'Bob', age: 25 },
  //     { name: 'Charlie', age: 35 },
  //   ];
  //   const columnsExample = [
  //     { label: 'Name', property: 'name' },
  //     { label: 'Age', property: 'age' },
  //   ];

  //   // Render the Table component with example data and columns
  //   render(<Table data={datasExample} columns={columnsExample} />);

  //   // Trigger the onChange event on the general search input with a search term
  //   fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Alice' } });

  //   // Check that expected elements are present and unexpected elements are absent
  //   expect(screen.getByText('Alice')).toBeInTheDocument();
  //   expect(screen.getByText('30')).toBeInTheDocument();
  //   expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  //   expect(screen.queryByText('25')).not.toBeInTheDocument();
  //   expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  //   expect(screen.queryByText('35')).not.toBeInTheDocument();
  // });
});




