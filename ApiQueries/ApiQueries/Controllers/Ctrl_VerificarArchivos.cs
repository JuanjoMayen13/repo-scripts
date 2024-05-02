using ApiQueries.Connection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;

namespace ApiQueries.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Ctrl_VerificarArchivos : ControllerBase
    {
        [HttpPost()]
        public IActionResult VerificarArchivos([FromBody] List<string> fileNames)
        {
            if (fileNames == null || fileNames.Count == 0)
            {
                return BadRequest("No se han proporcionado nombres de archivos.");
            }

            Conexion cn = new Conexion();

            try
            {
                // Filtrar solo los archivos que terminen en .sql
                var archivosEnFolder = fileNames.Where(fileName => fileName.EndsWith(".sql")).ToList();

                var archivosVerificados = new List<dynamic>(); // Cambio object a dynamic
                using (SqlConnection sqlConnection = new SqlConnection(cn.cadenaSQL()))
                {
                    sqlConnection.Open();
                    string sqlQuery = "SELECT Archivo, Fecha_Hora, UserName, Descripcion FROM tbl_A_Actualizacion ORDER BY Actualizacion DESC";
                    using (SqlCommand command = new SqlCommand(sqlQuery, sqlConnection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string archivo = reader.GetString(0);
                                string fechaHora = reader.IsDBNull(1) ? "" : reader.GetDateTime(1).ToString(); 
                                string userName = reader.IsDBNull(2) ? "" : reader.GetString(2); 
                                string descripcion = reader.IsDBNull(3) ? "" : reader.GetString(3); 

                                var archivoInfo = new
                                {
                                    Archivo = archivo,
                                    Fecha_Hora = fechaHora,
                                    UserName = userName,
                                    Descripcion = descripcion
                                };

                                archivosVerificados.Add(archivoInfo);
                            }
                        }
                    }
                }

                // Filtrar archivos encontrados y faltantes
                var archivosExistentes = archivosVerificados.Where(archivo => archivosEnFolder.Contains(archivo.Archivo)).Select(archivo => new
                {
                    Archivo = archivo.Archivo,
                    Fecha_Hora = archivo.Fecha_Hora,
                    UserName = archivo.UserName,
                    Descripcion = archivo.Descripcion
                }).ToList();

                var archivosFaltantes = archivosEnFolder.Except(archivosExistentes.Select(archivo => archivo.Archivo)).Select(archivo => new
                {
                    Archivo = archivo,
                    Fecha_Hora = "",
                    UserName = "",
                    Descripcion = ""
                }).ToList();


                var respuesta = new
                {
                    ArchivosGuardados = archivosExistentes,
                    ArchivosFaltantes = archivosFaltantes
                };

                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al verificar archivos: {ex.Message}");
            }
        }
    }
}
