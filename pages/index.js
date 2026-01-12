import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { BIBLE_BOOKS } from '../lib/constants';

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [book, setBook] = useState('');
  const [verses, setVerses] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      if (user) {
        fetchReports();
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchReports();
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchReports = async () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('reports')
      .select('*, profiles(name)')
      .gte('week_start', startOfWeek.toISOString().split('T')[0]);
    if (error) console.error(error);
    else setReports(data);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) alert(error.message);
      else alert('Check your email for confirmation!');
    }
  };

  const handleSubmitVerse = async (e) => {
    e.preventDefault();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const { error } = await supabase
      .from('reports')
      .insert([{ user_id: user.id, week_start: startOfWeek.toISOString().split('T')[0], verses: [{ book, verses }] }]);
    if (error) alert(error.message);
    else {
      alert('Submitted!');
      fetchReports();
      setBook('');
      setVerses('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '50px', backgroundColor: '#f9f7f4', minHeight: '100vh' }}>
        <Head>
          <title>Memora - Login</title>
        </Head>
        <h1 style={{ color: '#8b5a8c' }}>Welcome to Memora</h1>
        <form onSubmit={handleAuth} style={{ maxWidth: '300px', margin: '0 auto' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#8b5a8c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: '#8b5a8c' }}>
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f7f4', minHeight: '100vh' }}>
      <Head>
        <title>Memora</title>
      </Head>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#8b5a8c' }}>Memora</h1>
        <button onClick={handleLogout} style={{ padding: '5px 10px', backgroundColor: '#ddd', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </header>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#8b5a8c' }}>Submit Your Verses for This Week</h2>
        <p>It's encouraged to do this on Friday, but you can submit anytime.</p>
        <form onSubmit={handleSubmitVerse} style={{ marginBottom: '40px' }}>
          <select
            value={book}
            onChange={(e) => setBook(e.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">Select Book</option>
            {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="text"
            placeholder="Verses (e.g., 3:16-18 or 1,3,5)"
            value={verses}
            onChange={(e) => setVerses(e.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#8b5a8c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Submit
          </button>
        </form>
        <h2 style={{ color: '#8b5a8c' }}>This Week's Reports</h2>
        {reports.length === 0 ? <p>No reports yet.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reports.map(r => (
              <li key={r.id} style={{ backgroundColor: 'white', padding: '15px', margin: '10px 0', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <strong>{r.profiles?.name || 'Anonymous'}</strong>: {r.verses.map(v => `${v.book} ${v.verses}`).join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}