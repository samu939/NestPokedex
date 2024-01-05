import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
// import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
@Injectable()
export class SeedService {

  //constructor (private readonly pokemonService: PokemonService){}
  constructor (
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly axios: AxiosAdapter
  ){}
  
  
  async poblateDB(){
    await this.pokemonModel.deleteMany({});
    const data= await this.axios.get<PokeResponse>("https://pokeapi.co/api/v2/pokemon?limit=650")

    const pokemonToInserts: {name: string, no:number}[] = []

    data.results.forEach( async ({name, url}) =>{

      const segments = url.split("/");
      const no: number = + segments[segments.length-2];

      // this.pokemonService.create({no,name});


      // const pokemon = await this.pokemonModel.create({no,name});


      // insertPromises.push(
      //   this.pokemonModel.create({no,name})
      // );

      pokemonToInserts.push({name,no});

    });

    await this.pokemonModel.insertMany(pokemonToInserts);

    // await Promise.all(insertPromises);

    return 'Seed Executed'; 
  }
}
