using AspApp.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Validation.AspNetCore;

namespace AspApp.Controllers;

public class AdministrationCoontrollers : ControllerBase
{
    public AdministrationCoontrollers() { }


    [HttpGet]
    [GenerateAntiforgeryTokenCookie]
    [Authorize]//(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public IActionResult GetCsrf()
    {
        return Ok();
    }




}