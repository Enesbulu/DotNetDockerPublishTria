using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Todo> Todos => Set<Todo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Todo>().HasData(
            new Todo { Id = 1, Title = "Docker Sandbox Projesini Çalıştır", IsCompleted = true },
            new Todo { Id = 2, Title = "CRUD İşlemlerini Test Et", IsCompleted = false },
            new Todo { Id = 3, Title = "Çevre Değişkenlerini Optimize Et", IsCompleted = false }
        );
    }
}
