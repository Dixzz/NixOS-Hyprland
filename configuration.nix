# ?Edit this configuration file to define what should be installed on
# your system.  Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running ‘nixos-help’).

{ config, pkgs, ... }:
let
  nixvim = import (builtins.fetchGit {
    url = "https://github.com/nix-community/nixvim";
    # If you are not running an unstable channel of nixpkgs, select the corresponding branch of Nixvim.
    # ref = "nixos-25.11";
  });
in
{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
#      <home-manager/nixos>
#      nixvim.nixosModules.nixvim
    ];

  # Bootloader.
  #boot.loader.systemd-boot.enable = true;
  #boot.loader.efi.canTouchEfiVariables = true;
  boot.loader.systemd-boot.enable = false;

  boot.loader = {
    efi.canTouchEfiVariables = true;
    grub = {
      enable = true;
      #devices = [ "/dev/sda2" ];  # Set the correct device here
      devices = [ "nodev" ];
      efiSupport = true;
      useOSProber = true;
    };
  };
  #boot.loader.grub.grubGeneration = true;
 # programs.nixvim.enable = true;
  hardware.graphics.enable = true;
  hardware.bluetooth.enable = true;
  services.upower.enable = true;
  services.power-profiles-daemon.enable = true;

programs.niri = {
  enable = true;
};

     programs.uwsm = {
        enable = true;
        waylandCompositors = { 
          niri = {
            prettyName = "Niri";
            comment = "A scrollable-tiling Wayland compositor";
            binPath = "/run/current-system/sw/bin/niri-session";
          };
        };
      };
  nix.settings.experimental-features = [ "nix-command" "flakes" ];


  #fileSystems."/run/media/fed/DATA" = {
  #  device = "/dev/sda1";
  #  fsType = "ntfs"; # use kernel driver; change to "ntfs-3g" if you install ntfs-3g
  #  options = [ "rw" "uid=1000" "gid=100" "umask=0022" ];
  #};

  #programs.nix-ld.enable = true;
  #programs.nix-ld.libraries = [ pkgs.glibc ];

  programs.nix-ld = {
    enable = true;
    libraries = pkgs.steam-run.args.multiPkgs pkgs;
  };

  networking.hostName = "nixos"; # Define your hostname.
  # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

  # Configure network proxy if necessary
  # networking.proxy.default = "http://user:password@proxy:port/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Enable networking
  networking.networkmanager.enable = true;

  services.noctalia-shell.enable = true;  
  #services.thermald.enable = true;
  
  # Set your time zone.
  time.timeZone = "Asia/Kolkata";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_IN";

  i18n.extraLocaleSettings = {
    LC_ADDRESS = "en_IN";
    LC_IDENTIFICATION = "en_IN";
    LC_MEASUREMENT = "en_IN";
    LC_MONETARY = "en_IN";
    LC_NAME = "en_IN";
    LC_NUMERIC = "en_IN";
    LC_PAPER = "en_IN";
    LC_TELEPHONE = "en_IN";
    LC_TIME = "en_IN";
  };

  # Enable the X11 windowing system.
  services.xserver.enable = true;
  services.xserver.videoDrivers = [
    "modesetting"  # example for Intel iGPU; use "amdgpu" here instead if your iGPU is AMD
    "nvidia"
  ];

  # --- Automounting and disk management ---
  services.udisks2.enable = true;
  services.gvfs.enable = true;      # for automount and trash support in Thunar
  services.tumbler.enable = true;   # for thumbnails in Thunar

  # --- File explorer ---
  programs.thunar.enable = true;
  programs.thunar.plugins = with pkgs.xfce; [ thunar-volman ];

  # --- Polkit (permissions for non-root mounting) ---
  security.polkit.enable = true;
  security.polkit.extraConfig = ''
    polkit.addRule(function(action, subject) {
      if ((action.id == "org.freedesktop.udisks2.filesystem-mount-system" ||
           action.id == "org.freedesktop.udisks2.filesystem-mount") &&
          subject.isInGroup("wheel")) {
        return polkit.Result.YES;
      }
    })
  '';

  #programs.waybar.enable = true;


  # Load nvidia driver for Xorg and Wayland
  hardware.nvidia = {

    # Modesetting is required.
    modesetting.enable = true;

    # Nvidia power management. Experimental, and can cause sleep/suspend to fail.
    # Enable this if you have graphical corruption issues or application crashes after waking
    # up from sleep. This fixes it by saving the entire VRAM memory to /tmp/ instead 
    # of just the bare essentials.
    powerManagement.enable = false;

    # Fine-grained power management. Turns off GPU when not in use.
    # Experimental and only works on modern Nvidia GPUs (Turing or newer).
    powerManagement.finegrained = true;

    # Use the NVidia open source kernel module (not to be confused with the
    # independent third-party "nouveau" open source driver).
    # Support is limited to the Turing and later architectures. Full list of 
    # supported GPUs is at: 
    # https://github.com/NVIDIA/open-gpu-kernel-modules#compatible-gpus 
    # Only available from driver 515.43.04+
    open = true;

    # Enable the Nvidia settings menu,
	# accessible via `nvidia-settings`.
    nvidiaSettings = false;

    # Optionally, you may need to select the appropriate driver version for your specific GPU.
    package = config.boot.kernelPackages.nvidiaPackages.stable;


    prime = {
    offload.enable = true;
    sync.enable = false;
    intelBusId = "PCI:0:2:0";
    nvidiaBusId = "PCI:1:0:0";

    };
  };

  # Enable the GNOME Desktop Environment.
  services.xserver.displayManager.gdm.enable = true;
  services.xserver.desktopManager.gnome.enable = true;

  fonts.fonts = with pkgs; [
   # font-awesome_4

             pkgs.nerd-fonts._0xproto
  ];

  # Configure keymap in X11
  services.xserver.xkb = {
    layout = "us";
    variant = "";
  };

  # Enable CUPS to print documents.
  services.printing.enable = true;

  # Enable sound with pipewire.
  services.pulseaudio.enable = false;
  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
    # If you want to use JACK applications, uncomment this
    #jack.enable = true;

    # use the example session manager (no others are packaged yet so this is enabled by default,
    # no need to redefine it in your config for now)
    #media-session.enable = true;
  };

  # Enable touchpad support (enabled default in most desktopManager).
  # services.xserver.libinput.enable = true;

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.fed = {
    isNormalUser = true;
    description = "fed";
    extraGroups = [ "networkmanager" "wheel" "storage" "disk" ];
    packages = with pkgs; [
    #  thunderbird
       asusctl
       zoxide
 #      rustup
 #      (builtins.getFlake "/home/fed/zed-flake").packages.x86_64-linux.zed-latest
    ];
    shell = pkgs.fish;
  };
  services.supergfxd.enable = true;
  services = {
      asusd = {
        enable = true;
        #enableUserService = true; only in 25.05
      };
  };

  # Enable automatic login for the user.
  #services.displayManager.autoLogin.enable = true;
  #services.displayManager.autoLogin.user = "fed";

  # Workaround for GNOME autologin: https://github.com/NixOS/nixpkgs/issues/103746#issuecomment-945091229
  systemd.services."getty@tty1".enable = false;
  systemd.services."autovt@tty1".enable = false;

  # Install firefox.
  programs.firefox.enable = true;


  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;

  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    #noctalia-qs
    noctalia-shell
    wl-clipboard 
    neovim # Do not forget to add an editor to edit configuration.nix! The Nano editor is also installed by default.
    fish
    git
    kitty
    wget
    #gnome-extension-manager
  ];


  programs.fish.enable = true;

  # --- Kernel / memory tuning ---
  boot.kernel.sysctl = {
    "vm.swappiness" = 10;             # Prefer using RAM over swap (default ~60)
    "vm.vfs_cache_pressure" = 50;     # Keep inode/dentry caches longer
    "vm.dirty_ratio" = 10;            # Start writing dirty pages early
    "vm.dirty_background_ratio" = 5;  # Keep background writes responsive
  };

  # --- CPU governor: keep performance up during compiles ---
  #powerManagement = {
  #  enable = true;
  #  cpuFreqGovernor = "performance";  # Keeps CPU at full clock during build
  #};

  # --- I/O scheduler (for SSDs / NVMe, low latency) ---
  #boot.kernelParams = [
  #  "scsi_mod.use_blk_mq=1"
  #  "dm_mod.use_blk_mq=1"
  #  "queue_algorithm=none"
  #];

  # --- Optional: ZRAM or Swap tuning ---
  zramSwap = {
    enable = true;
    priority = 100;
    algorithm = "zstd";
    memoryPercent = 30;               # use 20% of RAM for fast compressed swap
  };


  # --- Optional: make cargo build faster ---
  #environment.sessionVariables = {
  #  CARGO_BUILD_JOBS = "$(nproc)";       # Use all CPU cores
  #  CARGO_TERM_PROGRESS_WHEN = "always"; # show progress bars
  #  RUSTC_WRAPPER = "sccache";           # use compiler cache (if installed)
  #};

  # --- Optional compiler cache for Rust ---
  #programs.sccache.enable = true;

  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  # programs.mtr.enable = true;
  # programs.gnupg.agent = {
  #   enable = true;
  #   enableSSHSupport = true;
  # };

  # List services that you want to enable:

  # Enable the OpenSSH daemon.
  # services.openssh.enable = true;

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It‘s perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "25.05"; # Did you read the comment?

#home-manager.users.fed = { pkgs, ... }: {
#home.stateVersion = "25.05";  
#home.packages = [ ];
#  };
}
