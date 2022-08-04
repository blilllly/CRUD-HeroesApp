import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Heroe, Publisher } from '../../interfaces/heroe.interface';
import { HeroesService } from '../../services/heroes.service';
import { config, of, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarComponent } from '../../components/confirmar/confirmar.component';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styles: [`
    img {
      width: 100%;
      border-radius: 15px
    }
  `]
})
export class AgregarComponent implements OnInit {

  publishers = [
    {
      id: 'DC Comics',
      desc: 'DC'
    },
    {
      id: 'Marvel Comics',
      desc: 'MARVEL'
    }
  ]

  heroe: Heroe = {
    superhero: '',
    alter_ego: '',
    characters: '',
    first_appearance: '',
    publisher: Publisher.DCComics,
    alt_img: ''
  }

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    if ( !this.router.url.includes('editar') ) {
      return
    }

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroePorId( id ) )
      )
      .subscribe( heroe => this.heroe = heroe )

  }

  guardar() {
    if( this.heroe.superhero.trim().length === 0 ) { return }

    if( this.heroe.id ) {
      //Actualizar
      this.heroesService.actualizarHeroe( this.heroe )
        .subscribe( heroe => this.mostrarSnack(`${heroe.superhero} se actualizó.`) )

    }else {
      //Crear
      this.heroesService.agregarHeroe( this.heroe )
        .subscribe( heroe => {
          this.router.navigate(['/heroes/editar', heroe.id]);
          this.mostrarSnack(`${heroe.superhero} se guardó.`);
        });
      
    }

  }

  borrar(){

    this.dialog.open(ConfirmarComponent, {
      width: '250px',
      data: this.heroe
    }).afterClosed().pipe( //el of(false) devuelve un observable booleano
      switchMap( resp => resp ? this.heroesService.borrarHeroe(this.heroe.id!) : of(false) )
    )
    .subscribe( ok => {
      if( ok ) {
        this.router.navigate([ '/heroes' ]);
        this.mostrarSnack(`${this.heroe.superhero} se eliminó correctamente.`);
      }
    })

    //se utilizó switchmap para no tener un subscribe que dependa de un subscribe
    
    // .subscribe( si => {
      
    //   if( si ) {
        
    //     this.heroesService.borrarHeroe( this.heroe.id! )
    //       .subscribe( resp => {
    //         this.router.navigate(['/heroes'])
    //       } );
        
    //     this.mostrarSnack( `${this.heroe.superhero} se eliminó correctamente.` )
          
    //   }

    // })

  }

  mostrarSnack( msj: string ) {
    this.snackBar.open( msj, 'ok!', { duration: 2000 } )
  }

}
