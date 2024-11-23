FROM ruby:3.2.2-alpine AS chat

RUN apk --update add \
    build-base \
    tzdata \
    libc6-compat \
    postgresql-dev \
    postgresql-client \
    mysql-client \
    mysql-dev \
    redis \
    imagemagick \
    imagemagick-dev \
    libjpeg-turbo \
    curl \
    vips \
    vips-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY Gemfile* /app/
RUN gem update --system 3.5.23
RUN gem install bundler -v $(tail -n 1 Gemfile.lock)
RUN bundle config set without 'development test'
RUN bundle check || bundle install
RUN bundle clean --force

RUN apk --update add yarn=1.22.22
COPY package.json yarn.lock /app/
RUN yarn install --check-files

COPY . /app/

RUN chmod +x ./s3-entrypoint.sh
ENTRYPOINT ["./s3-entrypoint.sh"]

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]