import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">创建账import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-d??</p>

        {error && <div className="aimport axios from 'axios';

export default functi={han
export default function v c  const [username, setUsername] = useSt <  const [email, setEmail] = useState('');
  co
   const [password, setPassword] = useStaxt  const [error, setError] = useState('');
  co    const [loading, setLoading] = useStatean  const navigate = useNavigate();

  async func  
  async function handleSubmit(e?"
    e.preventDefault();
    setError('');
    setLdi    setError('');
    ssName="auth-form-gr
    try {
      awaabe      awam      navigate('/login');
    } catch (err: any)               type="ema    } catch (err: any) {am      setError(err.resp      } finally {
      setLoading(false);
    }
  }

  return (
    <div classNa        setLoadiol    }
  }

  return (
     }
  
   r    <div         <div className="auth-car          <h1 className="auth-titlm-import { Link, useNavigate } from 'react-router-d??</p>

        {error && <div cla
 
        {error && <div className="aimport axios from aut
export default functi={han
export default function v c  conge=export default function vge  co
   const [password, setPassword] = useStaxt  const [error, setError] = useState('');
  co    const [loa     di  co    const [loading, setLoading] = useStatean  const navigate = useNavigate();

  
  async func  
  async function handleSubmit(e?"
    e.preventDefault();
    se     async functsN    e.preventDefault();
    setE?   setError('');
    lo    setLdi    se?<    ssName="auth-form-gr
       try {
      awaabe }
