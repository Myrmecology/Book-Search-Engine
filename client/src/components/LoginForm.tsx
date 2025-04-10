import { useState } from 'react';
import { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import { LOGIN_USER } from '../utils/mutations';
import Auth from '../utils/auth';
// Removed unused User type import I may need to add it back later

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState<{ username?: string; email: string; password: string }>({ username: '', email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [login, { error }] = useMutation(LOGIN_USER);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const { data } = await login({
        variables: {
          email: userFormData.email,
          password: userFormData.password,
        },
      });

      const { token } = data.login;
      Auth.login(token);
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({ username: '', email: '', password: '' });
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert || !!error} variant='danger'>
        Something went wrong with your login credentials!
      </Alert>

      <Form.Group className='mb-3'>
        <Form.Label htmlFor='email'>Email</Form.Label>
        <Form.Control
          type='text'
          placeholder='Your email'
          name='email'
          onChange={handleInputChange}
          value={userFormData.email || ''}
          required
        />
        <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label htmlFor='password'>Password</Form.Label>
        <Form.Control
          type='password'
          placeholder='Your password'
          name='password'
          onChange={handleInputChange}
          value={userFormData.password || ''}
          required
        />
        <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
      </Form.Group>
      <Button
        disabled={!(userFormData.email && userFormData.password)}
        type='submit'
        variant='success'>
        Submit
      </Button>
    </Form>
  );
};

export default LoginForm;

