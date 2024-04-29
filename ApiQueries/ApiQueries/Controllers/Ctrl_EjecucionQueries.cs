using ApiQueries.Connection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;

namespace ApiQueries.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Ctrl_EjecucionQueries : ControllerBase
    {
        [HttpPost()]
        public IActionResult ExecuteSqlFolder([FromBody] string folderPath)
        {
            if (string.IsNullOrEmpty(folderPath))
            {
                return BadRequest("No se ha proporcionado una ruta de carpeta.");
            }

            Conexion cn = new Conexion();

            try
            {
               
                string[] sqlFiles = Directory.GetFiles(folderPath, "*.sql");

           
                using (SqlConnection sqlConnection = new SqlConnection(cn.cadenaSQL()))
                {
                    sqlConnection.Open();

                    foreach (var sqlFile in sqlFiles)
                    {
                        string sqlScript = System.IO.File.ReadAllText(sqlFile);
                        using (SqlCommand command = new SqlCommand(sqlScript, sqlConnection))
                        {
                            command.ExecuteNonQuery();
                        }
                    }
                }

                return Ok("Archivos SQL ejecutados correctamente.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al ejecutar archivos SQL: {ex.Message}");
            }
        }
    }
}
