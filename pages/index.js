import Head from 'next/head';
import Home from '../components/Home';

export default function Index() {
  return (
    <div>
      <Head>
        <title>Memora - Scripture Memorization Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Home />
    </div>
  );
}

