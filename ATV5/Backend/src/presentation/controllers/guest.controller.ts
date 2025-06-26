// src/presentation/controllers/guest.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CreateGuestUseCase } from '../../application/use-cases/guest/create-guest.use-case';
import { GetGuestUseCase } from '../../application/use-cases/guest/get-guest.use-case';
import { UpdateGuestUseCase } from '../../application/use-cases/guest/update-guest.use-case';
import { DeleteGuestUseCase } from '../../application/use-cases/guest/delete-guest.use-case';
import { GetGuestsUseCase } from '../../application/use-cases/guest/get-guests.use-case';
import { CreateGuestDto } from '../../core/dtos/guest/create-guest.dto';
import { UpdateGuestDto } from '../../core/dtos/guest/update-guest.dto';
import { PaginationOptions } from '../../core/interfaces/repositories/base.repository.interface';

export class GuestController {
  constructor(
    private readonly createGuestUseCase: CreateGuestUseCase,
    private readonly getGuestUseCase: GetGuestUseCase,
    private readonly updateGuestUseCase: UpdateGuestUseCase,
    private readonly deleteGuestUseCase: DeleteGuestUseCase,
    private readonly getGuestsUseCase: GetGuestsUseCase
  ) {}

  async createGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createGuestDto: CreateGuestDto = req.body;
      const guest = await this.createGuestUseCase.execute(createGuestDto);
      
      res.status(201).json({
        success: true,
        message: 'Guest created successfully',
        data: guest
      });
    } catch (error) {
      next(error);
    }
  }

  async getGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const guest = await this.getGuestUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'Guest retrieved successfully',
        data: guest
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const options: PaginationOptions = {
        page,
        limit,
        search,
        sortBy,
        sortOrder
      };

      const result = await this.getGuestsUseCase.execute(options);
      
      if ('data' in result) {
        // Paginated result
        res.status(200).json({
          success: true,
          message: 'Guests retrieved successfully',
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        });
      } else {
        // All guests
        res.status(200).json({
          success: true,
          message: 'Guests retrieved successfully',
          data: result,
          count: result.length
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getPrimaryGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guests = await this.getGuestsUseCase.getPrimaryGuests();
      
      res.status(200).json({
        success: true,
        message: 'Primary guests retrieved successfully',
        data: guests,
        count: guests.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCompanions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companions = await this.getGuestsUseCase.getAllCompanions();
      
      res.status(200).json({
        success: true,
        message: 'Companions retrieved successfully',
        data: companions,
        count: companions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanionsByPrimaryId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { primaryId } = req.params;
      const companions = await this.getGuestsUseCase.getCompanionsByPrimaryId(primaryId);
      
      res.status(200).json({
        success: true,
        message: 'Companions retrieved successfully',
        data: companions,
        count: companions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateGuestDto: UpdateGuestDto = req.body;
      const guest = await this.updateGuestUseCase.execute(id, updateGuestDto);
      
      res.status(200).json({
        success: true,
        message: 'Guest updated successfully',
        data: guest
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteGuestUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'Guest deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}