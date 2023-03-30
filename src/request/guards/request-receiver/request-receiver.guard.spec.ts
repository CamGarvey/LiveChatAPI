import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NumberLike } from 'hashids/cjs/util';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestReceiverGuard } from './request-receiver.guard';

describe('RequestReceiverGuard', () => {
  let guard: RequestReceiverGuard;
  let prisma: PrismaService;
  let hashService: HashService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RequestReceiverGuard,
        { provide: PrismaService, useValue: {} },
        { provide: HashService, useValue: {} },
      ],
    }).compile();

    guard = moduleRef.get<RequestReceiverGuard>(RequestReceiverGuard);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    hashService = moduleRef.get<HashService>(HashService);
  });

  describe('canActivate', () => {
    it('should return true if the user is the request receiver', async () => {
      const mockRequestId: NumberLike[] = [1];
      const mockUserId = 123;
      const mockRequest = { receiverId: 123 };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: mockUserId } }),
        }),
      } as ExecutionContext;

      jest.spyOn(hashService, 'decode').mockReturnValueOnce(mockRequestId);
      jest
        .spyOn(prisma.request, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockRequest as any);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(hashService.decode).toHaveBeenCalledWith(mockRequestId);
      expect(prisma.request.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: mockRequestId },
        select: { receiverId: true },
      });
    });

    it('should return false if the user is not the request creator', async () => {
      const mockRequestId: NumberLike[] = [1];
      const mockUserId = 123;
      const mockRequest = { receiverId: 456 };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: mockUserId } }),
        }),
      } as ExecutionContext;

      jest.spyOn(hashService, 'decode').mockReturnValueOnce(mockRequestId);
      jest
        .spyOn(prisma.request, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockRequest as any);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(hashService.decode).toHaveBeenCalledWith(mockRequestId);
      expect(prisma.request.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: mockRequestId },
        select: { receiverId: true },
      });
    });
  });
});
