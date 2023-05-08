import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { ServicioDaoApiService } from '../../servicios/dao-api.service';
import { EntityListarFiltro } from '../../dtos/entity-listar-filtro';
import { DtoSecret } from '../../dtos/dto-secret';
import { Oauth2Service } from 'src/app/servicios/oauth2.service';
import { EntitySecreto } from 'src/app/dtos/entity-secreto';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-vista-home',
  templateUrl: './vista-home.component.html',
  styleUrls: ['./vista-home.component.css']
})
export class VistaHomeComponent implements OnInit {


  //----- Constructor
  constructor(
    private servicioDao: ServicioDaoApiService,
    public oauth2Service: Oauth2Service
  ) { }

  //----- Variables globales
  public listaSecretos: DtoSecret[] = [];
  public entitySecreto: DtoSecret = new DtoSecret();
  public entitySecretoAdmin: DtoSecret = new DtoSecret();
  public entitySecretoGuardado: DtoSecret = new DtoSecret();
  public entityListarFiltro: EntityListarFiltro = new EntityListarFiltro();


  //------ Configuraciónes: Formulario y variables para usuarios
  public mensajeValidarForm: String = "";
  public tituloBtn: String = "";
  public tituloForm: String = "";
  public puedeEditarSecreto: Boolean = false;
  public numeroPaginas: number[] = [];


    // ======= Configuraciónes: Formulario y variables para user =======
   validarFormulario = new FormGroup({
    fg_secreto: new FormControl("", [Validators.required]),
    fg_categoria: new FormControl("", Validators.required),
    fg_id: new FormControl(),
    fg_fCracion: new FormControl()

  });

  //-- Limpiar formulario: User
  private limpiarForm(): void {
    this.validarFormulario.reset();
  }

  //----- Activar formulario editar
  private activarFormularioEditar() {
    this.tituloForm = "¡Estas punto de editar tu secreto!";
    this.tituloBtn = "Editar Secreto";
  }


  //----- Activar formulario guardar
  public activarFormularioGuardar() {
    this.tituloForm = "¡Comparte tu secreto aquí!";
    this.tituloBtn = "Guardar Secreto";
    this.limpiarForm();
  }


  //======= Configuraciónes: Formulario y variables para admin =======
  public isActivecontenedorFormAdmin:boolean=false;
  validarFormularioAdmin=new FormGroup({
    fa_secreto: new FormControl('',[Validators.required]),
    fa_categoria: new FormControl('',[Validators.required]),
    fa_fecha:new FormControl('',[Validators.required])
   });

   public activarContenedorFormAdmin():void{
      let seccionFormUser = document.getElementById('contenedor2');
      if (seccionFormUser!=null) {
        seccionFormUser.style.display='none';
      }
      this.isActivecontenedorFormAdmin=true;
   }

   public desactivarContenedorFormAdmin():void{
    let seccionFormUser = document.getElementById('contenedor2');
    if (seccionFormUser!=null) {
      seccionFormUser.style.display='block';
    }
    this.isActivecontenedorFormAdmin=false;
   }





  // =============================== METODOS PRINCIPALES ===============================

  //----- Metodo listar secretos por paginando
  public listarSecretosPaginado(pagina: number): void {
    this.servicioDao.listarPaginadoSecretos(pagina, 10).subscribe(
      HttpResponse => {
        this.listaSecretos = HttpResponse.content;
        this.creandoPaginadoParaRecorrer(HttpResponse.totalPages);

      },
      HttpErrorResponse => {
        this.manejoDeErrores(HttpErrorResponse);
      }
    );
  }



  //----- Metodo listar secretos por filtro
  public filtrarSecretosCategoria(): void {

    let categoria: String = (document.getElementById('filtro-buscar-por-categoria') as HTMLInputElement).value;

    if (categoria == "Todos") {
      this.listarSecretosPaginado(0);
    } else {
      this.servicioDao.listarSecretosPorCategoria(categoria).subscribe(
        HttpResponse => {
          this.listaSecretos = HttpResponse;
          this.numeroPaginas = [];
        },
        HttpErrorResponse => {
          this.manejoDeErrores(HttpErrorResponse);
        })
    }
  }


  //----- Metodo guardar/editar secreto
  public guardarSecreto(): void {

    if (this.validarFormulario.valid) {

      if (!this.entitySecreto.id) {

        this.servicioDao.guardarSecreto(this.entitySecreto).subscribe(
          HttpResponse => {
            swal.fire("¡SECRETO GUARDADO!", "", "success");
            this.entitySecretoGuardado = HttpResponse;
            this.puedeEditarSecreto = true;

            this.limpiarForm();
            this.listarSecretosPaginado(0);
            this.activarFormularioGuardar();
          },
          HttpErrorResponse => {
            this.manejoDeErrores(HttpErrorResponse);
          });


      } else {

        this.servicioDao.actualizarSecreto(this.entitySecreto).subscribe(
          HttpResponse => {
            swal.fire("¡SECRETO ACTUALIZADO!", "", "success");
            this.entitySecretoGuardado = HttpResponse;
            this.puedeEditarSecreto = true;
            this.limpiarForm();
            this.listarSecretosPaginado(0);
            this.activarFormularioGuardar();
          },
          HttpErrorResponse => {
            this.manejoDeErrores(HttpErrorResponse);
          });

      }
      this.mensajeValidarForm = "";
    } else {
      this.mensajeValidarForm = "*Rellena todos los campos";

    }

  }

  public editarSecretoAdmin():void{


    if (this.validarFormularioAdmin.valid && this.entitySecretoAdmin.id)  { 
        this.servicioDao.actualizarSecretoAdmin(this.entitySecretoAdmin).subscribe(
          HttpResponse => {
            swal.fire("¡SECRETO ACTUALIZADO!", "", "success");
            this.listarSecretosPaginado(0);

          },
          HttpErrorResponse => {
            this.manejoDeErrores(HttpErrorResponse);
          });
      this.mensajeValidarForm = "";

    } else {
      this.mensajeValidarForm = "*Rellena todos los campos";
    }

  }


  //----- Metodo eliminar secreto
  public eliminarSecreto(entitySecreto: DtoSecret): void {
    swal.fire({
      title: '¿Estas seguro/a?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡Eliminalo!',
      cancelButtonText: 'No, ¡Cancelar!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.servicioDao.eliminarSecreto(entitySecreto.id).subscribe(
          HttpResponse => {
            swal.fire("¡SECRETO ELIMINADO!", "", "success");

            if (this.entitySecretoGuardado == this.entitySecretoGuardado) {
              this.puedeEditarSecreto = false;
            }

            this.listarSecretosPaginado(0);
          },
          HttpErrorResponse => {
            this.manejoDeErrores(HttpErrorResponse);
          }
        );

      }

    })
  }


  //----- Metodo buscar secreto: User
  public buscarSecreto(entitySecreto: DtoSecret):void {
    this.servicioDao.buscarSecreto(entitySecreto.id).subscribe(
      HttpResponse => {
        this.entitySecreto = HttpResponse;
        this.activarFormularioEditar();
        this.listarSecretosPaginado(0);
        document.getElementById("btnConfesar")?.click();
      }, HttpErrorResponse => {
        this.manejoDeErrores(HttpErrorResponse);
      })
  }

    //----- Metodo buscar secreto: Admin
    public buscarSecretoAdmin(entitySecreto: DtoSecret):void {
      this.servicioDao.buscarSecreto(entitySecreto.id).subscribe(
        HttpResponse => {
          this.entitySecretoAdmin = HttpResponse;
          this.activarContenedorFormAdmin();
          this.listarSecretosPaginado(0);
          document.getElementById("btnConfesar")?.click();
        }, HttpErrorResponse => {
          this.manejoDeErrores(HttpErrorResponse);
        })
    }


  //----- Metodo eliminar secreto como admin
  public eliminarSecretoComoAdmin(entitySecreto: EntitySecreto): void {
    swal.fire({
      title: '¿Estas seguro/a?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡Eliminalo!',
      cancelButtonText: 'No, ¡Cancelar!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.servicioDao.eliminarSecretoComoAdmin(entitySecreto.id).subscribe(
          HttpResponse => {
            swal.fire("¡SECRETO ELIMINADO!", "", "success");
            this.listarSecretosPaginado(0);
        },
        HttpErrorResponse => {
            this.manejoDeErrores(HttpErrorResponse);
          }
        );

      }

    })
  }


  ngOnInit(): void {
    this.activarFormularioGuardar();
    this.listarSecretosPaginado(0);
  }

  
  // =============================== METODOS AUXILIARES ===============================



  //-- Metodo: Manejo de errores
  private manejoDeErrores(httpError: HttpErrorResponse) {
    switch (httpError.status) {
      case 401:
        swal.fire("¡ERROR 401 AL CARGAR!", httpError.error.error, "error");
        break;
      default:
        swal.fire("¡ERROR AL CARGAR!", httpError.error.error, "error");
        break;

    }
  }



  //-- Funcion de flecha
  private creandoPaginadoParaRecorrer = (paginas: number | undefined): void => {
    this.numeroPaginas = [];
    if (paginas != undefined) {
      for (let i = 0; i < paginas; i++) {
        this.numeroPaginas.push(i);
      }
    }
  }



}
