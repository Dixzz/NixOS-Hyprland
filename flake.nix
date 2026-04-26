{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    #nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    #niri.url = "path:/home/fed/niri-flake";
    niri.url = "git:https://github.com/sodiboo/niri-flake";
niri-nix = {
  url = "git+https://codeberg.org/BANanaD3V/niri-nix";
};
  };

  outputs = { self, nixpkgs, niri-nix, niri, ... }:
  {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";

      modules = [
        ./configuration.nix
        #niri-nix.nixosModules.default
	niri.nixosModules.niri
      ];
    };
  };
}
