import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {

    this.defaultLimit = configService.get<number>('defaultLimit');

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {


    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel.find().skip(offset).limit(limit).sort({no:1}).select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term))
      try {
        pokemon = await this.pokemonModel.findOne({ no: term });
      } catch (error) {
        throw new InternalServerErrorException(
          `Can't find Pokemon - Check server logs`,
        );
      }

    if (!pokemon && isValidObjectId(term))
      try {
        pokemon = await this.pokemonModel.findById(term);
      } catch (error) {
        throw new InternalServerErrorException(
          `Can't find Pokemon - Check server logs`,
        );
      }

    if (!pokemon)
      try {
        pokemon = await this.pokemonModel.findOne({
          name: term.toLocaleLowerCase().trim(),
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Can't find Pokemon - Check server logs`,
        );
      }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with no, name or id '${term}' does not exists`,
      );

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (!pokemon)
      throw new BadRequestException(
        `Pokemon with no, name or id '${term}' does not exists`,
      );

    if (updatePokemonDto.name != null)
      updatePokemonDto.name.toLocaleLowerCase().trim();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
    } catch (error) {
      this.handleException(error);
    }

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(term: string) {
    // const pokemon = await this.findOne(term);

    // await pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(term);
    const result = await this.pokemonModel.deleteOne({ _id: term });
    if (result.deletedCount == 0) {
      throw new BadRequestException(`Pokemon with id '${term}' not found`);
    }
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }

    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
