import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "@/config/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@/auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { AtGuard } from "./common/guards";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [process.env.NODE_ENV ? "dev" : ".env"],
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("mysql.host"),
        port: +configService.get<number>("mysql.port"),
        username: configService.get<string>("mysql.username"),
        password: configService.get<string>("mysql.password"),
        database: configService.get<string>("mysql.database"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
