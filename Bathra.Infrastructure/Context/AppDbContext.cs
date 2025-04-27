using System;
using System.Collections.Generic;
using Bathra.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bathra.Infrastructure.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Set_AccountType> Set_AccountTypes { get; set; }

    public virtual DbSet<Set_InvestmentFocus> Set_InvestmentFoci { get; set; }

    public virtual DbSet<Set_InvestmentRange> Set_InvestmentRanges { get; set; }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Subscription> Subscriptions { get; set; }
    public virtual DbSet<Startup> Startups { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<Set_AccountType>(entity =>
        {
            entity.HasKey(e => e.AccountTypeID);

            entity.ToTable("Set_AccountType");

            entity.Property(e => e.TypeName)
                .HasMaxLength(30)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Set_InvestmentFocus>(entity =>
        {
            entity.HasKey(e => e.InvestmentFocusID);

            entity.ToTable("Set_InvestmentFocus");

            entity.Property(e => e.FocusDetail).HasMaxLength(200);
            entity.Property(e => e.FocusName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Set_InvestmentRange>(entity =>
        {
            entity.HasKey(e => e.InvestmentRangeID);

            entity.ToTable("Set_InvestmentRange");

            entity.Property(e => e.RangeName).HasMaxLength(40);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CC40EAD5C");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534FEE5FA55").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.UserName)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Fk_AccountType).WithMany(p => p.Users)
                .HasForeignKey(d => d.Fk_AccountTypeID)
                .HasConstraintName("FK__Users__Fk_Accoun__4316F928");

            entity.HasOne(d => d.Fk_InvestmentFocus).WithMany(p => p.Users)
                .HasForeignKey(d => d.Fk_InvestmentFocusID)
                .HasConstraintName("FK__Users__Fk_Invest__440B1D61");

            entity.HasOne(d => d.Fk_InvestmentRange).WithMany(p => p.Users)
                .HasForeignKey(d => d.Fk_InvestmentRangeID)
                .HasConstraintName("Fk_InvestmentRange_Users");
        });


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
