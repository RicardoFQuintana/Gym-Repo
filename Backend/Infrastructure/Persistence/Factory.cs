using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Infrastructure.Persistence
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            // ⚠️ Ajustá esta cadena de conexión si usás otra instancia de SQL
            optionsBuilder.UseSqlServer(
                  "Server=localhost\\SQLEXPRESS;Database=GimnasioDB;Trusted_Connection=True;TrustServerCertificate=True;"
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}