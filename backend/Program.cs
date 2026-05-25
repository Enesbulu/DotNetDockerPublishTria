using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. .env dosyasini bulup yukleme
var currentDir = Directory.GetCurrentDirectory();
while (currentDir != null)
{
    var envPath = Path.Combine(currentDir, ".env");
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
        break;
    }
    currentDir = Directory.GetParent(currentDir)?.FullName;
}

// 2. Baglanti dizesini cekme
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Veritabanı bağlantı dizesi (DB_CONNECTION_STRING) çevre değişkenlerinde bulunamadı!");
}

// 2. Servisleri kaydetme
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. CORS Politikasi
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 5. Swagger, CORS ve Yonlendirme
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sandbox API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// 6. Otomatik EF Core Migration (Kurşungeçirmez Retry Mekanizması)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    int maxRetry = 10; // Toplam 30 saniye boyunca deneyecek
    
    for (int i = 0; i < maxRetry; i++)
    {
        try
        {
            db.Database.Migrate();
            Console.WriteLine("✅ Veritabanı migrasyonları başarıyla uygulandı ve tablolar çizildi.");
            break; // Başarılı olursa döngüyü kır ve uygulamayı başlat
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⏳ Veritabanı henüz hazır değil, bekleniyor... (Deneme {i + 1}/{maxRetry})");
            System.Threading.Thread.Sleep(3000); // 3 saniye bekle ve tekrar dene
        }
    }
}

app.Run();
