import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NumberLike } from 'hashids/cjs/util';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSenderGuard } from './request-sender.guard';

describe('RequestSenderGuard', () => {
  let guard: RequestSenderGuard;
  let prisma: PrismaService;
  let hashService: HashService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RequestSenderGuard,
        { provide: PrismaService, useValue: {} },
        { provide: HashService, useValue: {} },
      ],
    }).compile();

    guard = moduleRef.get<RequestSenderGuard>(RequestSenderGuard);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    hashService = moduleRef.get<HashService>(HashService);
  });

  describe('canActivate', () => {
    it('should return true if the user is the request creator', async () => {
      const mockRequestId: NumberLike[] = [1];
      const mockUserId = 123;
      const mockRequest = { createdById: 123 };

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
        select: { createdById: true },
      });
    });

    it('should return false if the user is not the request creator', async () => {
      const mockRequestId: NumberLike[] = [1];
      const mockUserId = 123;
      const mockRequest = { createdById: 456 };

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
        select: { createdById: true },
      });
    });
  });
});
