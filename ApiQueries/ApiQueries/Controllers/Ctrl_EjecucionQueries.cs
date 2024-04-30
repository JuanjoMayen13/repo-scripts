using ApiQueries.Connection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiQueries.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Ctrl_EjecucionQueries : ControllerBase
    {
        [HttpPost()]
        public async Task<IActionResult> UploadSqlFiles([FromForm] List<IFormFile> sqlFiles)
        {
            if (sqlFiles == null || !sqlFiles.Any())
            {
                return BadRequest("No se han proporcionado archivos SQL.");
            }

            Conexion cn = new Conexion();

            try
            {
                using (SqlConnection sqlConnection = new SqlConnection(cn.cadenaSQL()))
                {
                    await sqlConnection.OpenAsync();

                    foreach (var file in sqlFiles)
                    {
                        if (file == null || file.Length == 0)
                            continue;

                        using (var reader = new StreamReader(file.OpenReadStream()))
                        {
                            var sqlScript = await reader.ReadToEndAsync();

                            using (SqlCommand command = new SqlCommand(sqlScript, sqlConnection))
                            {
                                await command.ExecuteNonQueryAsync();
                            }
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
