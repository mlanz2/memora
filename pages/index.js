import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Memora - Scripture Memorization Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
        }
        h1 {
          color: #333;
        }
      `}</style>
      <h1>Welcome to Memora</h1>
      <p>Your scripture memorization progress tracker is coming soon!</p>
    </div>
  );
}