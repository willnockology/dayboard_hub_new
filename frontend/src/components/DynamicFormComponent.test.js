const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const axios = require('axios');
const DynamicFormComponent = require('./DynamicFormComponent').default;
const { BrowserRouter } = require('react-router-dom');

jest.mock('axios');

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('DynamicFormComponent', () => {
  const formDefinition = {
    _id: '668df1daa0123165b76d656c',
    formId: '8',
    form_name: 'Medical History',
    fields: [
      { field_name: 'name', field_title: 'Name', field_type: 'text' },
      { field_name: 'dob', field_title: 'Date of Birth', field_type: 'date' }
    ]
  };

  beforeEach(() => {
    localStorage.setItem('authToken', 'fakeToken');
    axios.get.mockResolvedValue({ data: formDefinition });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('submits the form successfully', async () => {
    const user = { name: 'John Doe' };
    localStorage.setItem('user', JSON.stringify(user));
    axios.post.mockResolvedValue({ data: {} });

    renderWithRouter(<DynamicFormComponent />, { route: '/form/MedicalHistory/1' });

    await waitFor(() => screen.getByText('Medical History'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2023-07-10' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(screen.queryByText('Form submitted successfully')).toBeInTheDocument());

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5001/api/forms/data',
      {
        formId: '668df1daa0123165b76d656c',
        fields: { name: 'John Doe', dob: '2023-07-10' },
        completedBy: 'John Doe',
        completedAt: expect.any(String)
      },
      {
        headers: {
          Authorization: 'Bearer fakeToken',
          'Content-Type': 'application/json'
        }
      }
    );
  });

  test('shows an error when user information is missing', async () => {
    renderWithRouter(<DynamicFormComponent />, { route: '/form/MedicalHistory/1' });

    await waitFor(() => screen.getByText('Medical History'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2023-07-10' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(screen.queryByText('User information is missing. Please login again.')).toBeInTheDocument());
  });

  test('shows an error when required fields are missing', async () => {
    const user = { name: 'John Doe' };
    localStorage.setItem('user', JSON.stringify(user));

    renderWithRouter(<DynamicFormComponent />, { route: '/form/MedicalHistory/1' });

    await waitFor(() => screen.getByText('Medical History'));

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(screen.queryByText('One or more required fields are missing')).toBeInTheDocument());
  });
});
