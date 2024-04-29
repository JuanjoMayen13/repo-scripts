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

                List<string> archivosGuardados = new List<string>();
                using (SqlConnection sqlConnection = new SqlConnection(cn.cadenaSQL()))
                {
                    sqlConnection.Open();
                    string sqlQuery = "SELECT Archivo FROM tbl_A_Actualizacion ORDER BY Actualizacion DESC";
                    using (SqlCommand command = new SqlCommand(sqlQuery, sqlConnection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                archivosGuardados.Add(reader.GetString(0));
                            }
                        }
                    }
                }

                // Obtener archivos existentes y faltantes
                List<string> archivosExistentes = archivosEnFolder.Intersect(archivosGuardados).ToList();
                List<string> archivosFaltantes = archivosEnFolder.Except(archivosGuardados).ToList();

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
