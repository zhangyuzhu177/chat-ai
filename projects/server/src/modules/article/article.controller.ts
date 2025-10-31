import { Controller, Get, Res } from "@nestjs/common";
import { ArticleService } from "./article.service";

@Controller('article')
export class ArticleController {
  constructor(private readonly _articleSrv: ArticleService) { }
  
  @Get('abstract')
  async abstract(
    @Res() res: Response
  ) {
    return await this._articleSrv.abstract(res);
  }
}