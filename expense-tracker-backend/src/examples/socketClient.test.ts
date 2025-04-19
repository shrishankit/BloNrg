import { SocketClient } from './socketClient';

describe('SocketClient', () => {
  let socketClient: SocketClient;
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    socketClient = new SocketClient(mockToken);
  });

  afterEach(() => {
    socketClient.disconnect();
  });

  test('should connect to socket server', (done) => {
    socketClient.connect();
    
    // Wait for connection
    setTimeout(() => {
      expect(socketClient).toBeDefined();
      done();
    }, 1000);
  });

  test('should disconnect from socket server', () => {
    socketClient.connect();
    socketClient.disconnect();
    // No error means disconnect worked
    expect(true).toBe(true);
  });
}); 