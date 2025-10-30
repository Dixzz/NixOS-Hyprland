# 💫 https://github.com/JaKooLit 💫 #
# Users - NOTE: Packages defined on this will be on current user only

{ pkgs, username, ... }:

let
  inherit (import ./variables.nix) gitUsername;
in
{
  users = { 
    mutableUsers = true;
    users."${username}" = {
      homeMode = "755";
      isNormalUser = true;
      description = "${gitUsername}";
      extraGroups = [
        "networkmanager"
        "wheel"
        "libvirtd"
        "scanner"
        "lp"
        "video" 
        "input" 
        "audio"
        "storage"
        "disk"
        "plugdev"
      ];

    # define user packages here
    packages = with pkgs; [
        asusctl
        zoxide

      ];
    };
    
    defaultUserShell = pkgs.fish;
  }; 
  
  environment.shells = with pkgs; [ zsh ];
  environment.systemPackages = with pkgs; [ lsd fzf ]; 
  
programs = {
  # Disable zsh entirely
  zsh.enable = false;

  # Enable fish shell
  fish = {
    enable = true;

    # Optional: add your own fish config
    shellInit = ''
      set -g theme_color_scheme solarized
      fish_add_path $HOME/.local/bin
    '';

    # Optional: enable plugins if using oh-my-fish or fisher
    # plugins = [
    #   { name = "bass"; src = pkgs.fishPlugins.bass; }
    #   { name = "fzf"; src = pkgs.fishPlugins.fzf; }
    # ];
  };
};
  
#  programs = {
 #   zsh = {
 #     ohMyZsh = {
 #       enable = true;
 #       theme = "agnoster";
 #       plugins = [ "git" ];
 #     };
 #   };
#  };
}
