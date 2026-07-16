using System.ComponentModel.DataAnnotations;
using System.Net;
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
    public IActionResult EnableTurnstile([FromServices] IConfiguration configuration)
    {
        return Ok(new { enableTurnstile = configuration.GetValue<bool>("TurnsTileEnable", false) });
    }



    [HttpGet]
    [Authorize]//(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public async Task<IActionResult> ProfileModel()
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
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



    [HttpPost]
    [Authorize]
    public async Task<IActionResult> EditUsername([FromBody][StringLength(64)] string Username)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        IdentityResult result = await _userManager.SetUserNameAsync(user, Username);
        if (result.Succeeded)
        {
            return Ok();
        }
        else
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(nameof(Username), error.Description);
            }
            return BadRequest(ModelState);
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> EditDisplayName([FromBody][StringLength(64)] string DisplayName)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        user.DisplayName = DisplayName;
        IdentityResult result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            return Ok();
        }
        else
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(nameof(DisplayName), error.Description);
            }
            return BadRequest(ModelState);
        }
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> ChangeEmail([FromBody][StringLength(128)] string NewEmail)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        string token = await _userManager.GenerateChangeEmailTokenAsync(user, NewEmail);
        string encodedToken = WebUtility.UrlEncode(token);

        //create an email message with the confirm-new-email link and send it to the new email address

        return Ok();
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> ConfirmNewEmail([FromQuery][StringLength(128)] string newEmail,
    [FromQuery][StringLength(256)] string token)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        string decodedToken = WebUtility.UrlDecode(token);
        IdentityResult result = await _userManager.ChangeEmailAsync(user, newEmail, decodedToken);
        if (result.Succeeded)
        {
            return Redirect("/");
        }
        else
        {
            return Redirect($"/Error?{result.Errors.SelectMany(e => e.Description + ",,")}");
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SendEmailValidationCode()
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        string token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        string encodedToken = WebUtility.UrlEncode(token);

        //create an email message with the confirm-email link and send it to the user's email address

        return Ok();
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> ConfirmEmail([FromQuery][StringLength(256)] string token)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        string decodedToken = WebUtility.UrlDecode(token);
        IdentityResult result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        if (result.Succeeded)
        {
            return Redirect("/");
        }
        else
        {
            return Redirect($"/Error?{result.Errors.SelectMany(e => e.Description + ",,")}");
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PublicEmail([FromBody] bool PublicEmail)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        user.PublicEmail = PublicEmail;
        IdentityResult result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            return Ok();
        }
        else
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(nameof(PublicEmail), error.Description);
            }
            return BadRequest(ModelState);
        }
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> EditDescription([FromBody][StringLength(1024)] string Description)
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
        if (user is null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = "invalid_user",//Errors.LoginRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Couldn't find the user."
                })
            );
        }

        user.Description = Description;
        IdentityResult result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            return Ok();
        }
        else
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(nameof(Description), error.Description);
            }
            return BadRequest(ModelState);
        }
    }





}