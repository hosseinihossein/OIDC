using AspApp.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AspApp.Controllers;

public class AdministrationCoontrollers : ControllerBase
{
    public AdministrationCoontrollers() { }


    [HttpGet]
    [GenerateAntiforgeryTokenCookie]
    [Authorize]
    public IActionResult GetCsrf()
    {
        return Ok();
    }
}