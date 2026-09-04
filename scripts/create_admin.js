const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = {
  projectId: "real-estaenz",
  clientEmail: "firebase-adminsdk-fbsvc@real-estaenz.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5K2zQdBiDQPzk\nvLwtKu6xleXYRFz5C5onBlAhns6YovLWLB/Ruwx/FWe/TPabdmylsiSyCD6Urhoz\nCoClo0KPYCdg5HJ8t8oIA38kDuLACs1miGxI3tfXNY44xQTox0SJgRRILBTRBzCF\nY3nkw2tUFmPFY4MDNonnagOLSiD+bzzcZ70U6UUW6LQ3eB7AXogaiTNZKagOP+cJ\nF62b6rsR0G0VXOl5ZZpwghVvU2gsyxmzuSEgOJxJaSeZ1CGa5LplAhUud47usUfd\npqFUOuLgqQqY4EXHjN5+c6FhMV5TBqev8IRpG1LvtOFyv0WW2VjZwV1s3yszaVo8\nE6jQuDwBAgMBAAECggEABIGtDUm2CwO64+o//i1sT8AhLulDBgClSMvbiWXvC0Hz\n/Qhn4dfWjwU7WCmMWu4/6Kx0Piz7MO0n0BQyW1Wk2g5yBuaobqaecSF8p6kBFcFt\njFBHqmJaCG/SPUl2PCAVZ+9PSg5gl1HAeY6ZOdsTsqE03mn0l1BtfMdUvMAaG3cY\n7m4hhhNsA+EGa1n0s28vFurSjAW2M7wstUgII8tVkAn0oRqnKyA6Q3XtqUfY/hgS\nh0U9h5mD0OHKiLa27q3kb7H18XmGXPb83Ym9JapGQXyqpxNHI25I1GpiJ81ju7GX\nXFyimWhqu8ggyYqKw0+FN7dze2Pg9xTPLdYtsktgkQKBgQDz/4owxUxGobuOU7I4\nFf7yxPwPcXUigEOEYsZxcVljFiSicBbO3u13qo6f+4lne/RKGllvVcn142llrqvJ\neg84UBGjilh0v3JB0z/obl+901OOxdcq+vemkdkgq+wIRbMlUzgbLjlOS69WqFPj\nXJKHPqTjpS7AyvV0Fnb8lpnlFQKBgQDCRxuCU6JvuTj6LEJxHaHJUgjP/NmPwUkx\nyLTWwdg6ZBMMHuODIBqAPDW58/K560BSMT7S4Tde6Vo2rsTj3KYkQSyHj1d24Dkc\nv1mclbK2Bfaa17OF5oQp2SYMJ3Xh1eauL8fTUIxJn97uMbrIfaROcCZlGc7amuLs\nn7JBQc+OPQKBgF6j46n/HRLYcLNH63ytq3Hmzg3/Z/u13HphBa/C03UHhbYr2+zp\nsxoTYbbUDfvBrIOBrObuU6O4TY1PLvq7CWRCSlUwuBawm1TE56j0BtbOPT7HpinZ\npm1JbPqrNKYQwufbW4vPZhLkcGIgcElkAsHKnpJd48CL+KDKheR7Vb3xAoGADlR0\nYP6OQrNk0n8lP3ayEklswPqjiYj2PyfQvu55ZoUvKnu0yF071y2ZwOePhcsmaWmc\neq2GCggoUVQ+zZfe4Vm1USJvjyMm00oB8BzSm76A3BcA9OV15ihQOCFI/qlqZHq9\nwIZ2co/KP8OHRXaPAgIfsuFecp1uE4oL+ehCyPkCgYEAkBLvEIl4c0kczpB2bkvE\n6JvanCq6NH4psHoAuJqssWfpRgd/CppNax5QhxkSVhuNGVQEmeHGFOcyahQ8mqe8\nzC1XWbuaOM/Ln8AiI7/mmJmhewi8UpEGcMYosiSL6YCTzCJRdGYlFKp7cZQeh/zt\nniYc3loXYQwYtjTQSU9sdwA=\n-----END PRIVATE KEY-----\n"
};

initializeApp({
  credential: cert(serviceAccount)
});

const email = "realestatenz01@gmail.com";
const password = "Spsltd@2026..";

async function createAdmin() {
  const auth = getAuth();
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: "Real Estate NZ Admin",
    });
    console.log("Successfully created new user:", userRecord.uid);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log("User already exists. Updating password...");
      try {
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, {
          password: password
        });
        console.log("Successfully updated password for existing user:", user.uid);
        process.exit(0);
      } catch (updateError) {
        console.error("Error updating user:", updateError);
        process.exit(1);
      }
    } else {
      console.error("Error creating user:", error);
      process.exit(1);
    }
  }
}

createAdmin();
