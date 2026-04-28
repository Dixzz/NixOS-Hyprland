{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    #nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    #niri.url = "path:/home/fed/niri-flake";
    #niri.url = "github:sodiboo/niri-flake";
    nvf = {
      url = "github:NotAShelf/nvf";
      # If you are not running an unstable channel of nixpkgs, select the corresponding branch of Nixvim.
      # url = "github:nix-community/nixvim/nixos-25.11";

      inputs.nixpkgs.follows = "nixpkgs";
    };

    noctalia = {
      url = "github:noctalia-dev/noctalia-shell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    niri-nix = {
      url = "git+https://codeberg.org/BANanaD3V/niri-nix";
    };
  };

  outputs = {
    self,
    nixpkgs,
    niri-nix,
    noctalia,
    nvf,
    ...
  }: {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      #specialArgs = { inherit niri-nix; };

      modules = [
        ./configuration.nix
        niri-nix.nixosModules.default
        #nixvim.nixosModules.nixvim
        nvf.nixosModules.default
        noctalia.nixosModules.default
        #niri.nixosModules.niri
      ];
    };
  };
}
