# Notes

## General

- Some misspellings on table/column names
- `Integer` is nullable. `int` is not. In DTOs and other places where the database `id` is used. It should always be `int`.
- Don't use `.orElseThrow()` by itself. Put the actual exception in there with a nice message. If you use the `EntityNotFoundException`, and have your project set up properly it should return a 404 to the user
- Same as above, don't throw a `RuntimeException` when an entity isn't found, use the `EntityNotFoundException` for springboot magic

## Controllers

- Use a @RestControllerAdvice class to catch all errors and you won't need to do any error handling. Just throw errors anywhere and let the RestControllerAdvice handle them
- Don't add path prefixes in your @RequestMapping like `@RequestMapping("/api/cards")`, instead keep them as `@RequestMapping("/cards")` and set the path prefix as an environment variable on your docker image with `SERVER_SERVLET_CONTEXT_PATH: "/api"`
- POST/DELETE requests should have a decorator `@ResponseStatus(HttpStatus.CREATED)` or `@ResponseStatus(HttpStatus.NO_CONTENT)`
- Never use constructors! in springboot use dependency injection for everything. For example in the `AllCardController` you should add the service as
    ```
    public class AllCardController {
      @Autowired
      private AllCardService service
      ...
    }
    ```
- Try to always add methods for:
    ```
    GET /endpoint
    GET /endpoint/{id}
    POST /endpoint/{id}
    PUT /endpoint/{id}
    DELETE /endpoint/{id}
    ```
    It's good for encouraging yourself to manage the database through the API for insertions/updates/deletes instead of hacking together springboot services for bootstrapping data
- In some places (AllCardsController) you have multiple methods that get a list based  on an argument. If you use a Specification object with a payload of optional filter arguments, you can reduce all of these down into the `GET /all-card` method.
- A list method that doesn't find any results shouldn't return a "NO_CONTENT" response. It's better for it to return an empty list instead

## DTOs
- The DTOs can be way simplified with Lombok decorators
- DTOs for making requests with can be a Record instead of a Class. It's fine for response DTOs to be a Record too.
  - It's helpful to write the DTO classes/records with a static method the builds the DTO from the object it's a DTO for. For example`
      ```
      public record CardTypeReponse(
          int id,
          String name
      ) {
          public static CardTypeReponse fromEntity(CardTypeReponse cardType) {
              return new CardTypeReponse(cardType.getId(), cardType.getType());
          }
      }
      ```
    That allows you to build dtos like `CardTypeResponse.fromEntity(myCardType)`

## Entities
- Use appropriate `@RequiredArgsConstructor` or  `@Builder` decorators to make the instantiation of entities in your service nicer to work with