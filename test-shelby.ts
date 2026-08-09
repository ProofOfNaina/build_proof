async function run() {
  const url = 'https://api.testnet.aptoslabs.com/nocode/v1/public/cmlfqs5wt00qrs601zt5s4kfj/v1/graphql';
  const query = `query { __typename }`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ query })
    });
    const text = await res.text();
    console.log(`Status: ${res.status}, Body: ${text.substring(0, 80)}`);
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }
}
run();
