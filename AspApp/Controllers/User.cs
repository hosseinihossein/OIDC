using AspApp.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using OpenIddict.Validation.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace AspApp.Controllers;

[ApiController]
[Route("Identity/Api/[controller]/[action]")]
public class UserController : ControllerBase
{
    private readonly UserManager<Identity_UserDbModel> _userManager;
    public UserController(UserManager<Identity_UserDbModel> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    [Authorize]//(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public async Task<IActionResult> ProfileModel()
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);//FindByIdAsync(User.GetClaim(Claims.Subject)!);
        if (user is null)
        {
            //ModelState.AddModelError("UserId", "Couldn't find any user with the specified user id.");
            //return BadRequest(ModelState);
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        User_Profile_Model profileModel = new()
        {
            CreatedAt = user.CreatedAt,
            Description = user.Description,
            DisplayName = user.DisplayName,
            Email = user.Email!,
            EmailConfirmed = user.EmailConfirmed,
            HasImage = user.HasImage,
            Id = user.Id,
            ImageVersion = user.ImageVersion,
            PublicEmail = user.PublicEmail,
            RemoteImageUrl = user.RemoteImageUrl,
            Username = user.UserName!,
            Roles = [.. await _userManager.GetRolesAsync(user)],
        };

        return Ok(profileModel);
    }

}