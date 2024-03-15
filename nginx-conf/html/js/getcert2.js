'use strict';
const tls = require('tls');
const socket = tls.connect({
host: 'www.5goats.cafe',
port: 443,
servername: 'www.5goats.cafe'
}, () => {
const peerCertificate = socket.getPeerCertificate();
console.log(peerCertificate);
socket.destroy();
});
socket.on('error', err => {
console.log('Error: ' + err.message);
});
socket.on('close', () => {
});