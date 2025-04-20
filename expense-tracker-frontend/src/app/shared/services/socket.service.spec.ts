import { TestBed } from '@angular/core/testing';
import { SocketService, OnlineUser } from './socket.service';
import { AuthService } from '../../core/auth.service';
import { BehaviorSubject, of } from 'rxjs';

// Mock socket.io-client
const mockSocket = {
  on: jasmine.createSpy('on'),
  emit: jasmine.createSpy('emit'),
  disconnect: jasmine.createSpy('disconnect'),
  connect: jasmine.createSpy('connect')
};

// Create a mock factory for socket.io-client
const mockIoFactory = () => mockSocket;

describe('SocketService', () => {
  let service: SocketService;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Create mock for AuthService
    const currentUserSubject = new BehaviorSubject<any>(null);
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      currentUser: currentUserSubject.asObservable(),
      currentUserValue: null
    });

    TestBed.configureTestingModule({
      providers: [
        SocketService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: 'io', useFactory: mockIoFactory }
      ]
    });

    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not connect when user is not logged in', () => {
    // Set current user to null
    (authServiceMock.currentUser as any) = of(null);
    
    // Trigger the subscription by setting a new value
    (authServiceMock.currentUser as any).next(null);
    
    // Verify socket was not initialized
    expect(mockSocket.connect).not.toHaveBeenCalled();
  });

  it('should connect when user is logged in', () => {
    // Mock user data
    const mockUser = { id: 1, username: 'testuser', role: 'USER' };
    
    // Set current user
    (authServiceMock.currentUser as any) = of(mockUser);
    (authServiceMock as any).currentUserValue = mockUser;
    
    // Trigger the subscription by setting a new value
    (authServiceMock.currentUser as any).next(mockUser);
    
    // Verify socket was initialized
    expect(mockSocket.connect).toHaveBeenCalled();
    
    // Verify authenticate event was emitted
    expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', mockUser);
  });

  it('should disconnect when user logs out', () => {
    // First connect with a user
    const mockUser = { id: 1, username: 'testuser', role: 'USER' };
    (authServiceMock.currentUser as any) = of(mockUser);
    (authServiceMock as any).currentUserValue = mockUser;
    (authServiceMock.currentUser as any).next(mockUser);
    
    // Then disconnect by setting user to null
    (authServiceMock.currentUser as any) = of(null);
    (authServiceMock as any).currentUserValue = null;
    (authServiceMock.currentUser as any).next(null);
    
    // Verify disconnect was called
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should update online users when receiving onlineUsersUpdate event', () => {
    // Mock user data
    const mockUser = { id: 1, username: 'testuser', role: 'USER' };
    
    // Set current user
    (authServiceMock.currentUser as any) = of(mockUser);
    (authServiceMock as any).currentUserValue = mockUser;
    
    // Trigger the subscription by setting a new value
    (authServiceMock.currentUser as any).next(mockUser);
    
    // Get the callback for the onlineUsersUpdate event
    const spyCalls = (mockSocket.on as jasmine.Spy).calls.allArgs();
    const onlineUsersUpdateCall = spyCalls.find(call => call[0] === 'onlineUsersUpdate');
    const onlineUsersUpdateCallback = onlineUsersUpdateCall ? onlineUsersUpdateCall[1] as Function : null;
    
    if (onlineUsersUpdateCallback) {
      // Mock online users data
      const mockOnlineUsers: OnlineUser[] = [
        { userId: 1, username: 'user1', role: 'USER' },
        { userId: 2, username: 'user2', role: 'ADMIN' }
      ];
      
      // Call the callback with mock data
      onlineUsersUpdateCallback({ count: 2, users: mockOnlineUsers });
      
      // Subscribe to the onlineUsers$ observable and check the value
      service.onlineUsers$.subscribe(users => {
        expect(users).toEqual(mockOnlineUsers);
      });
    }
  });

  it('should correctly check if a user is online', () => {
    // Mock user data
    const mockUser = { id: 1, username: 'testuser', role: 'USER' };
    
    // Set current user
    (authServiceMock.currentUser as any) = of(mockUser);
    (authServiceMock as any).currentUserValue = mockUser;
    
    // Trigger the subscription by setting a new value
    (authServiceMock.currentUser as any).next(mockUser);
    
    // Get the callback for the onlineUsersUpdate event
    const spyCalls = (mockSocket.on as jasmine.Spy).calls.allArgs();
    const onlineUsersUpdateCall = spyCalls.find(call => call[0] === 'onlineUsersUpdate');
    const onlineUsersUpdateCallback = onlineUsersUpdateCall ? onlineUsersUpdateCall[1] as Function : null;
    
    if (onlineUsersUpdateCallback) {
      // Mock online users data
      const mockOnlineUsers: OnlineUser[] = [
        { userId: 1, username: 'user1', role: 'USER' },
        { userId: 2, username: 'user2', role: 'ADMIN' }
      ];
      
      // Call the callback with mock data
      onlineUsersUpdateCallback({ count: 2, users: mockOnlineUsers });
      
      // Check if users are online
      expect(service.isUserOnline(1)).toBe(true);
      expect(service.isUserOnline(2)).toBe(true);
      expect(service.isUserOnline(3)).toBe(false);
    }
  });
}); 