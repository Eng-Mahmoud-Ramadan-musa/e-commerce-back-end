import { Client } from 'socket.io/dist/client';
import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Auth, AuthGuard, ROLES, TokenService } from 'src/Common';
import { connectedUsers, TOrder, TUser, UserRepository } from 'src/DB';

export interface IAuthSocket extends TUser {
  user: TUser;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
  namespace: 'chat',
})
export class RealTimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository, 
  ) {}

  afterInit(server: Server) {
    console.log('🚀 chat started');
  }

  destructAuthorization(client: Socket): string {
    const authFromAuth = client.handshake.auth.authorization;
    const authFromHeaders = client.handshake.headers.authorization;

    return authFromAuth || authFromHeaders;
  }

  async handleConnection(client: Socket) {
    try {
      const authorization = this.destructAuthorization(client);

      if (!authorization) {
        console.log('❌ No authorization found');
        client.emit('exception', { message: 'No authorization provided' });
        client.disconnect();
        return;
      }

      const user = await this.tokenService.verifyTokenAuth(authorization as unknown as string);

      client['user'] = user;
      console.log(`✅ ${user._id} connected`);
      connectedUsers.set(user._id.toString(), client.id);
      
    } catch (error) {
      console.error('❌ Error during connection:', error);
      client.emit('exception', { message: error.message || 'Unknown error' });
      client.disconnect();
      return;
      
    }

  }

  handleDisconnect(client: Socket) {
    try {
      const user = client['user'];
      if (user) {
        connectedUsers.delete(user._id.toString());
        this.server.emit('userOffline', { userId: user._id.toString() });
        console.log(`❌ ${user._id} disconnected`);
      }
      
    } catch (error) {
    console.error('❌ Error sending category message:', error);
    this.server.emit('exception', { message: error.message || 'Unknown error' });
    }
  }
  
async sendOrderMessageToAdmins(orderStatus: string, orderId: string, userName: string) {
  try {
    const status = orderStatus === "created" ? "new" : orderStatus;
    const admins = await this.userRepository.find({ filter: { role: ROLES.Admin } });
    const message = `${status} order by ${userName} with ID: ${orderId}`;
  
    for (const admin of admins) {
      const socketId = connectedUsers.get(admin._id.toString());
  
      if (!socketId) {
        console.warn(`⚠️ Admin ${admin.userName} is not connected`);
        continue;
      }
  
      console.log(`📤 Emitting to admin ${admin.userName} with socket ID ${socketId}`);
      this.server.to(socketId).emit('order:Created', message);
    }
    
  } catch (error) {
    console.error('❌ Error sending category message:', error);
    this.server.emit('exception', { message: error.message || 'Unknown error' });
  }
}


sendOrderMessageToSeller(id: string, status: string, quantity: number, title: string, stock: number) {
  try {
    const socketId = connectedUsers.get(id);
  
    if (!socketId) {
      console.warn(`⚠️ Seller with ID ${id} is not connected. Cannot send order message.`);
      return;
    }
  
    const message = `${quantity} pieces of the ${title} were ${status}, leaving stock ${stock}.`;
    this.server.to(socketId).emit('order:Created', message);
    
  } catch (error) {
    console.error('❌ Error sending category message:', error);
    this.server.emit('exception', { message: error.message || 'Unknown error' });
  }
}


async sendOrderMessageUpdated(order: TOrder, user: TUser) {
try {
    // جلب كل الأدمنات
  const admins = await this.userRepository.find({ filter: { role: ROLES.Admin } });

  // تجهيز الـ IDs
  const recipientIds = new Set<string>();

  admins.forEach((admin: TUser) => {
    if (admin?._id) {
      recipientIds.add(admin._id.toString());
    }
  });

  // إضافة صاحب الأوردر لو المستخدم الحالي مش User
  if (user.role !== ROLES.User && order.createdBy) {
    recipientIds.add(order.createdBy.toString());
  }

  const message = `🛒 Order ${order._id} updated by ${user.userName}`;

  // إرسال الإشعار لكل socket متصل فعليًا
  for (const userId of recipientIds) {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('order:updated', message);
      console.log(`📤 Sent to ${userId} (socket: ${socketId})`);
    } else {
      console.log(`⚠️ User ${userId} is offline or not connected`);
    }
  }
} catch (error) {
  console.error('❌ Error sending category message:', error);
  this.server.emit('exception', { message: error.message || 'Unknown error' });
}
}


async sendCategoryMessageCreated(category: string, userName: string) {
  try {
    const sellers = await this.userRepository.find({ filter: { role: ROLES.Seller } });

    const message = `New category '${category}' created by ${userName}.`;

    console.log('📢 Sending message to sellers:', sellers.map((s) => s.userName));

    for (const seller of sellers) {
      const socketId = connectedUsers.get(seller._id.toString());
      console.log(`📤 Emitting to seller ${socketId}`);
      this.server.to(socketId as string).emit('category:Created', message);
    }
  } catch (error) {
    console.error('❌ Error sending category message:', error);
    this.server.emit('exception', { message: error.message || 'Unknown error' });
  }
}

}
