async function testAllAccounts() {
  const accounts = [
    { u: 'dancu', p: '123' },
    { u: 'canbo', p: '123' },
    { u: 'chutich', p: '123' },
    { u: 'it_admin', p: '123' }
  ];

  for (const a of accounts) {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: a.u, password: a.p })
    });
    const data = await res.json();
    console.log(`Account ${a.u}:`, res.status === 200 ? `SUCCESS (Role: ${data.vai_tro}, ID: ${data.tai_khoan_id})` : 'FAILED');
  }
}

testAllAccounts();
