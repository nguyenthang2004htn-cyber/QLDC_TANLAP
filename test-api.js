import http from 'http';

http.get('http://localhost:4000/api/reports?area=Khu%20ph%E1%BB%91%202', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});
